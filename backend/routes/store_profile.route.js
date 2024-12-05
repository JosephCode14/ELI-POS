const router = require("express").Router();
const { where, Op, literal } = require("sequelize");
const sequelize = require("../db/config/sequelize.config");
const {
  Store_Profile,
  Store_Status,
  Store_Status_History,
  Order_Transaction,
  Cart,
  Product_Inventory_Accumulate,
  Raw_Inventory_Accumulate,
  Activity_Log,
  Category_Product,
  Category,
  Product,
  Store_Report,
  CashierReport,
  UserLogin,
  MasterList,
} = require("../db/models/associations");
const session = require("express-session");
const moment = require("moment-timezone");

router.route("/save_profile").put(async (req, res) => {
  try {
    const {
      userId,
      storeCode,
      storeName,
      storeCountry,
      storeImage,
      ipPrinter,
      mealPrice,
      idleTime,
    } = req.body;

    const data = await Store_Profile.findOne();

    if (data) {
      const isUpdate = await Store_Profile.update(
        {
          store_code: storeCode,
          store_name: storeName,
          store_country: storeCountry,
          store_ip: ipPrinter,
          image: storeImage || null,
          store_student_meal_price: parseFloat(mealPrice),
          idle_time: parseFloat(idleTime),
        },
        {
          where: { store_profile_id: data.store_profile_id },
        }
      );

      if (isUpdate) {
        const categ = await Product.findAll({
          include: [
            {
              model: Category_Product,
              required: true,
              include: [
                {
                  model: Category,
                  required: true,
                  where: {
                    name: {
                      [Op.in]: [
                        "Student Meal - Dinner",
                        "Student Meal - Breakfast",
                        "Student Meal - Lunch",
                      ],
                    },
                  },
                },
              ],
            },
          ],
        });

        for (let product of categ) {
          await product.update({
            price: mealPrice,
          });
        }

        const act_log = await Activity_Log.create({
          masterlist_id: userId,
          action_taken: `Updated the information of store profile`,
        });

        if (act_log) {
          res.status(200).send({ message: "true" });
        }
      }
    } else {
      const isCreate = await Store_Profile.create({
        store_code: storeCode,
        store_name: storeName,
        store_country: storeCountry,
        ipPrinter: ipPrinter,
        image: storeImage || null,
        store_student_meal_price: mealPrice,
      });

      if (isCreate) {
        const act_log = await Activity_Log.create({
          masterlist_id: userId,
          action_taken: `Created new information of store profile`,
        });

        if (act_log) {
          res.status(200).send({ message: "true" });
        }
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/fetchProfile").get(async (req, res) => {
  try {
    const data = await Store_Profile.findOne();

    if (data) {
      res.status(200).json(data);
    } else {
      res.status(202).json({ message: "Profile not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/fetchStatus").get(async (req, res) => {
  try {
    let data = await Store_Status.findByPk(1);

    if (!data) {
      data = await Store_Status.create({
        store_status_id: 1,
        status: 0,
      });
    }

    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

function formatDateToLocal(date) {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Singapore",
  })
    .format(date)
    .replace(",", "")
    .replace(/\//g, "-");
}

router.route("/update_status").put(async (req, res) => {
  try {
    const { storeStatus, userId } = req.body;

    const storeStatusLast = await Store_Status.findOne({
      where: { store_status_id: 1 },
      attributes: ["updatedAt"],
    });

    const isStoreOpen = storeStatus === 1 || storeStatus === true;

    if (!storeStatusLast) {
      return res.status(201).json("Store status not found");
    }

    const updatedAtDate = new Date(storeStatusLast.updatedAt);

    const formattedDate = updatedAtDate.toISOString().split("T")[0];

    const storeOpenStart = new Date(`${formattedDate}T00:00:00`);
    const storeEndClose = new Date(`${formattedDate}T23:59:59`);

    const minCreatedAtRecord = await Store_Status_History.min("createdAt", {
      where: {
        createdAt: {
          [Op.between]: [storeOpenStart, storeEndClose],
        },
      },
    });

    const maxCreatedAtRecord = await Store_Status_History.max("createdAt", {
      where: {
        createdAt: {
          [Op.between]: [storeOpenStart, storeEndClose],
        },
      },
    });

    let minCreatedAt = formatDateToLocal(minCreatedAtRecord);
    let maxCreatedAt = formatDateToLocal(maxCreatedAtRecord);

    const shiftLogs = await UserLogin.findAll({
      where: {
        createdAt: {
          [Op.gte]: minCreatedAt,
        },
        status: "Start",
      },
    });

    const referenceIdsWithStart = shiftLogs.map((record) => record.reference);

    const endStatuses = await UserLogin.findAll({
      where: {
        reference: {
          [Op.in]: referenceIdsWithStart,
        },
        status: "End",
      },
      attributes: ["reference"],
      group: ["reference"],
    });

    const referenceIdsWithEnd = endStatuses.map((record) => record.reference);

    const remainingShifts = referenceIdsWithStart.filter(
      (id) => !referenceIdsWithEnd.includes(id)
    );

    console.log("shiftLogs", shiftLogs);

    console.log("Remaining", remainingShifts.length);

    // if (remainingShifts.length > 0) {
    //   return res.status(201).send({ message: "There are ongoing shift" });
    // }

    if (
      minCreatedAtRecord == null ||
      maxCreatedAtRecord == null ||
      remainingShifts.length == 0
    ) {
      const status = await Store_Status.findByPk(1);

      await status.update({ status: storeStatus });

      // Create reference

      const currentDate = moment().tz("Asia/Manila").toDate();
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0");
      const currentMonthDay = `${year}-${month}`;

      // Find the last order with the current date prefix
      const lastPayCode = await Store_Status_History.findOne({
        where: {
          reference: {
            [Op.like]: `${currentMonthDay}%`,
          },
        },
        order: [["createdAt", "DESC"]],
      });

      let newRefCode;
      if (lastPayCode && lastPayCode.reference) {
        const latestRefCode = lastPayCode.reference;
        const sequenceNumber = latestRefCode.slice(-4);
        const latestSequence = parseInt(sequenceNumber, 10);
        const newSequence = String(latestSequence + 1).padStart(4, "0");
        newRefCode = `${currentMonthDay}-${newSequence}`;
      } else {
        newRefCode = `${currentMonthDay}-0001`;
      }

      // Check if the newly may existing order
      let checkOrderNumber = await Store_Status_History.findOne({
        where: {
          reference: newRefCode,
        },
      });

      // If it exists, increment again until a maging unique
      while (checkOrderNumber) {
        const sequenceNumber = newRefCode.slice(-4);
        const latestSequence = parseInt(sequenceNumber, 10);
        const newSequence = String(latestSequence + 1).padStart(4, "0");
        newRefCode = `${currentMonthDay}${newSequence}`;

        checkOrderNumber = await Store_Status_History.findOne({
          where: {
            reference: newRefCode,
          },
        });
      }

      await Store_Status_History.create({
        store_status_id: status.store_status_id,
        status: storeStatus,
        reference: newRefCode,
        masterlist_id: userId,
      });

      const actionTaken = isStoreOpen
        ? "Dashboard: User opened the store"
        : "Dashboard: User closed the store";

      await Activity_Log.create({
        masterlist_id: userId,
        action_taken: actionTaken,
      });

      res.status(200).send({ message: "Success" });
    } else {
      res.status(201).send({ message: "There are ongoing shift" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/open_store").put(async (req, res) => {
  try {
    const { storeStatus, userId } = req.body;

    const status = await Store_Status.findByPk(1);

    const isStoreOpen = storeStatus === 1 || storeStatus === true;

    await status.update({ status: storeStatus });

    // Create reference

    const currentDate = moment().tz("Asia/Manila").toDate();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const currentMonthDay = `${year}-${month}`;

    // Find the last order with the current date prefix
    const lastPayCode = await Store_Status_History.findOne({
      where: {
        reference: {
          [Op.like]: `${currentMonthDay}%`,
        },
      },
      order: [["createdAt", "DESC"]],
    });

    let newRefCode;
    if (lastPayCode && lastPayCode.reference) {
      const latestRefCode = lastPayCode.reference;
      const sequenceNumber = latestRefCode.slice(-4);
      const latestSequence = parseInt(sequenceNumber, 10);
      const newSequence = String(latestSequence + 1).padStart(4, "0");
      newRefCode = `${currentMonthDay}-${newSequence}`;
    } else {
      newRefCode = `${currentMonthDay}-0001`;
    }

    // Check if the newly may existing order
    let checkOrderNumber = await Store_Status_History.findOne({
      where: {
        reference: newRefCode,
      },
    });

    // If it exists, increment again until a maging unique
    while (checkOrderNumber) {
      const sequenceNumber = newRefCode.slice(-4);
      const latestSequence = parseInt(sequenceNumber, 10);
      const newSequence = String(latestSequence + 1).padStart(4, "0");
      newRefCode = `${currentMonthDay}${newSequence}`;

      checkOrderNumber = await Store_Status_History.findOne({
        where: {
          reference: newRefCode,
        },
      });
    }

    await Store_Status_History.create({
      store_status_id: status.store_status_id,
      status: storeStatus,
      reference: newRefCode,
      masterlist_id: userId,
    });

    const actionTaken = isStoreOpen
      ? "Dashboard: User opened the store"
      : "Dashboard: User closed the store";

    await Activity_Log.create({
      masterlist_id: userId,
      action_taken: actionTaken,
    });

    res.status(200).send({ message: "Success" });
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/close_store").put(async (req, res) => {
  try {
    const { storeStatus, userId, reference } = req.body;

    const storeStatusLast = await Store_Status.findOne({
      where: { store_status_id: 1 },
      attributes: ["updatedAt"],
    });

    const isStoreOpen = storeStatus === 1 || storeStatus === true;

    if (!storeStatusLast) {
      return res.status(201).json("Store status not found");
    }

    const updatedAtDate = new Date(storeStatusLast.updatedAt);

    const formattedDate = updatedAtDate.toISOString().split("T")[0];

    const storeOpenStart = new Date(`${formattedDate}T00:00:00`);
    const storeEndClose = new Date(`${formattedDate}T23:59:59`);

    const minCreatedAtRecord = await Store_Status_History.min("createdAt", {
      where: {
        createdAt: {
          [Op.between]: [storeOpenStart, storeEndClose],
        },
      },
    });

    const maxCreatedAtRecord = await Store_Status_History.max("createdAt", {
      where: {
        createdAt: {
          [Op.between]: [storeOpenStart, storeEndClose],
        },
      },
    });

    let minCreatedAt = formatDateToLocal(minCreatedAtRecord);
    let maxCreatedAt = formatDateToLocal(maxCreatedAtRecord);

    const shiftLogs = await UserLogin.findAll({
      where: {
        createdAt: {
          [Op.gte]: minCreatedAt,
        },
        status: "Start",
      },
    });

    const referenceIdsWithStart = shiftLogs.map((record) => record.reference);

    const endStatuses = await UserLogin.findAll({
      where: {
        reference: {
          [Op.in]: referenceIdsWithStart,
        },
        status: "End",
      },
      attributes: ["reference"],
      group: ["reference"],
    });

    const referenceIdsWithEnd = endStatuses.map((record) => record.reference);

    const remainingShifts = referenceIdsWithStart.filter(
      (id) => !referenceIdsWithEnd.includes(id)
    );

    console.log("Remaining", remainingShifts.length);

    if (remainingShifts.length > 0) {
      return res.status(201).send({ message: "There are ongoing shift" });
    }

    const status = await Store_Status.findByPk(1);

    await status.update({ status: storeStatus });

    await Store_Status_History.create({
      store_status_id: status.store_status_id,
      status: storeStatus,
      reference: reference,
      masterlist_id: userId,
    });

    const actionTaken = isStoreOpen
      ? "Dashboard: User opened the store"
      : "Dashboard: User closed the store";

    await Activity_Log.create({
      masterlist_id: userId,
      action_taken: actionTaken,
    });

    res.status(200).send({ message: "Success" });
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/getReference").get(async (req, res) => {
  try {
    const refRecords = await Store_Status_History.findOne({
      where: {
        status: 1,
      },
      order: [["createdAt", "DESC"]],
    });

    console.log("Refereence", refRecords.reference);

    if (refRecords) {
      return res.status(200).json(refRecords);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/storeProfileAutoAdd").post(async (req, res) => {
  try {
    const data = await Store_Profile.findOne();

    if (data) {
      return res.status(203).json("Already Created");
    } else {
      await Store_Profile.create({
        store_code: null,
        store_name: null,
        store_country: null,
        store_ip: null,
        image: null,
        store_student_meal_price: 50,
        idle_time: 20,
      });
    }

    res.status(201).json({ message: "added successfully" });
  } catch (error) {
    console.error("Error: Problem on inserting", error);
    res.status(500).json({ message: "Error inserting categories" });
  }
});

router.route("/DashboardData").get(async (req, res) => {
  try {
    // Get the store status

    const minRef = await Store_Status_History.findOne({
      where: {
        status: 1,
      },
      order: [["createdAt", "DESC"]],
    });

    const refeCode = minRef.reference;
    const minCreatedAt = minRef.createdAt;

    const maxRef = await Store_Status_History.findOne({
      where: {
        status: 0,
        reference: refeCode,
      },
      order: [["createdAt", "DESC"]],
    });

    console.log("Maxref", maxRef);
    const status = maxRef == null ? 1 : 0;

    const maxCreatedAt = maxRef?.createdAt;

    // Sum the payable amount
    let sumCondition;
    if (status === 1) {
      sumCondition = {
        createdAt: {
          [Op.gte]: minCreatedAt,
        },
        status: "Ordered",
      };
    } else {
      sumCondition = {
        createdAt: {
          [Op.between]: [minCreatedAt, maxCreatedAt],
        },
        status: "Ordered",
      };
    }

    // const sumResult = await Order_Transaction.sum("payable_amount", {
    //   where: sumCondition,
    // });

    const sumResult = await Cart.sum("subtotal", {
      where: {
        createdAt: {
          [Op.gte]: minCreatedAt,
        },
      },
    });

    // Count ng mga Order Transaction na ang status is 'Ordered'
    const countOrdered = await Order_Transaction.count({
      where: sumCondition,
    });

    // Sum conditions for Product Inventory Accumulate
    let inventorySumCondition;
    if (status === 1) {
      inventorySumCondition = {
        createdAt: {
          [Op.gte]: minCreatedAt,
        },
      };
    } else {
      inventorySumCondition = {
        createdAt: {
          [Op.between]: [minCreatedAt, maxCreatedAt],
        },
      };
    }

    // Sum the total price from Product_Inventory_Accumulate
    const inventorySumResult = await Product_Inventory_Accumulate.sum(
      "total_price",
      {
        where: inventorySumCondition,
      }
    );

    //Sum conditions for Raw Inventory Accumulate
    let rawInventorySumCondition;
    if (status === 1) {
      rawInventorySumCondition = {
        createdAt: {
          [Op.gte]: minCreatedAt,
        },
      };
    } else {
      rawInventorySumCondition = {
        createdAt: {
          [Op.between]: [minCreatedAt, maxCreatedAt],
        },
      };
    }

    //Sum the total price from Raw Inventory Accumulate
    const rawInventorySumResult = await Raw_Inventory_Accumulate.sum(
      "total_price",
      {
        where: rawInventorySumCondition,
      }
    );

    //Sum condition para sa cart quantity
    let CartQTYSumCondition;
    if (status === 1) {
      CartQTYSumCondition = {
        createdAt: {
          [Op.gte]: minCreatedAt,
        },
      };
    } else {
      CartQTYSumCondition = {
        createdAt: {
          [Op.between]: [minCreatedAt, maxCreatedAt],
        },
      };
    }

    //Sum the number of quantity sa cart para mabilang yung item na nasold
    const cartItems = await Cart.findAll({
      attributes: ["quantity"],
      where: CartQTYSumCondition,
      include: [
        {
          model: Order_Transaction,
          required: true,
          attributes: [],
          where: {
            status: "Ordered",
            masterlist_id: { [Op.ne]: 1 },
          },
        },
      ],
      raw: true,
    });

    const totalQuantity = cartItems.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    const cartQTYSumResult = { totalQuantity };

    const totalProductSold = cartQTYSumResult
      ? cartQTYSumResult.totalQuantity
      : 0;

    res.json({
      totalPayableAmount: sumResult || 0,
      totalInventoryPrice: inventorySumResult || 0,
      totalRawInventoryPrice: rawInventorySumResult || 0,
      totalOrder: countOrdered || 0,
      totalProductSold: totalProductSold,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/storeClose").post(async (req, res) => {
  try {
    const { totalSales, totalPurchased, totalSold } = req.body;

    const minRef = await Store_Status_History.findOne({
      where: {
        status: 1,
      },
      order: [["createdAt", "DESC"]],
    });

    const refeCode = minRef.reference;
    const minCreatedAt = minRef.createdAt;

    const maxRef = await Store_Status_History.findOne({
      where: {
        status: 0,
        reference: refeCode,
      },
      order: [["createdAt", "DESC"]],
    });

    console.log("Maxref", maxRef);

    const maxCreatedAt = maxRef.createdAt;

    const fields = [
      "total_income",
      "total_item_sold",
      "total_checkout",
      "total_refund",
      "total_cash",
      "total_card",
      "difference",
      "remittance",
      "total_load",
    ];
    const results = await Promise.all(
      fields.map((field) =>
        CashierReport.sum(field, {
          where: {
            createdAt: {
              [Op.between]: [minCreatedAt, maxCreatedAt],
            },
          },
        })
      )
    );

    const [
      totalIncome,
      totalItemSold,
      totalCheckout,
      totalRefund,
      totalCash,
      totalCard,
      difference,
      remittance,
      total_load,
    ] = results;

    const totalCardOverall = await Order_Transaction.sum("payable_amount", {
      where: {
        createdAt: {
          [Op.between]: [minCreatedAt, maxCreatedAt],
        },
        payment_method: "CARD",
        status: "Ordered",
      },
    });

    console.log("Income Cashier", totalIncome);
    console.log("Total Item Sold", totalItemSold);
    console.log("Total Checkout", totalCheckout);

    // Get minCreatedAt and maxCreatedAt galing Store_Status_History

    console.log("close", minCreatedAt, maxCreatedAt);
    const formatMax = new Date(maxCreatedAt).toISOString().split("T")[0];

    console.log("FORMAT", formatMax);

    const data = await Store_Report.create({
      store_open: minCreatedAt,
      store_close: maxCreatedAt,
      total_sales: totalSales,
      total_purchased: totalPurchased, // per transction
      total_sold: totalSold, // per item
      total_refund: totalRefund,
      total_cash: totalCash,
      total_card: totalCardOverall,
      total_difference: difference,
      total_remittance: remittance,
      total_load: total_load,
    });

    res.status(200).json({ data });
  } catch (error) {
    console.error("Error: Problem on inserting", error);
    res.status(500).json({ message: "Error inserting categories" });
  }
});

module.exports = router;
