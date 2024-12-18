const router = require("express").Router();
const { Sequelize, where, Op } = require("sequelize");
const sequelize = require("../db/config/sequelize.config");
const {
  Load_Transaction,
  Student_Balance,
  Student,
  Order_Transaction,
  Cart,
  Checkout_Transaction,
  Product_Inventory,
  Product,
  Category,
  Category_Product,
  Receiving_Stock_Inventory,
  Product_Inventory_Accumulate,
  Inventory_Receiving_Transaction,
  Outbound_Stock_Inventory,
  Inventory_Outbound_Transaction,
  Product_Inventory_Outbound,
  Stock_Counting_Inventory,
  Inventory_Stock_Counting_Transaction,
  Product_Inventory_Counting,
  Bulk_Load_Transaction,
  Bulk_Load,
  Bulk_Load_Student,
  Activity_Log,
  RawInventory,
  RawMaterial,
  Store_Status_History,
  MasterList,
  Raw_Inventory_Receiving_Transaction,
  Raw_Inventory_Accumulate,
  Raw_Inventory_Outbound_Transaction,
  Raw_Inventory_Outbound,
  Raw_Inventory_Counting_Transaction,
  Raw_Inventory_Counting,
  Cart_Specification_Variant,
  Specification_Variant,
  Credit_Student_Meal,
  CashierReport,
  Store_Report,
} = require("../db/models/associations");

//RFID REPORTS MODULE
router.route("/fetchRFIDtransactions").get(async (req, res) => {
  try {
    const data = await Load_Transaction.findAll({
      include: [
        {
          model: Student_Balance,
          required: true,
          include: [
            {
              model: Student,
              required: true,
            },
          ],
        },
        {
          model: MasterList,
          required: true,
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    if (data) {
      return res.json(data);
    } else {
      res.status(400).json("No data found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

//POS REPORTS MODULE
router.route("/fetchPOStransactions").get(async (req, res) => {
  try {
    // const { fromDate, endDate } = req.query;

    // const startOfDay = new Date(fromDate);
    // startOfDay.setHours(0, 0, 0, 0);

    // // Ensure endDate is the end of the day
    // const endOfDay = new Date(endDate);
    // endOfDay.setHours(23, 59, 59, 999);

    const data = await Cart.findAll({
      include: [
        {
          model: Order_Transaction,
          required: true,
          include: [
            {
              model: MasterList,
              required: true,
            },
          ],
        },
        {
          model: Product_Inventory,
          required: true,
          include: [
            {
              model: Product,
              required: true,
              include: [
                {
                  model: Category_Product,
                  required: true,
                  include: [
                    {
                      model: Category,
                      required: true,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          model: Cart_Specification_Variant,
          required: false,
          include: [
            {
              model: Specification_Variant,
              required: true,
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      // where: {
      //   createdAt: {
      //     [Op.between]: [startOfDay, endOfDay],
      //   },
      // },
    });

    if (data) {
      return res.json(data);
    } else {
      res.status(400).json("No data found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

// For Customer Reports
router.route("/fetchStudentReports").get(async (req, res) => {
  try {
    const data = await Order_Transaction.findAll({
      include: [
        {
          model: Student,
          required: true,
          where: { category: "Student" },
        },
        {
          model: Cart,
          required: true,
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    if (data) {
      return res.json(data);
    } else {
      res.status(400).json("No data found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/searchStudent").get(async (req, res) => {
  try {
    const { search } = req.query;

    const data = await Order_Transaction.findAll({
      include: [
        {
          model: Student,
          where: {
            [Op.or]: [
              { first_name: { [Op.like]: `%${search}%` } },
              { last_name: { [Op.like]: `%${search}%` } },
              { category: { [Op.like]: `%${search}%` } },
              { rfid: { [Op.like]: `%${search}%` } },
              {
                [Op.and]: search.split(" ").map((namePart) => ({
                  [Op.or]: [
                    { first_name: { [Op.like]: `%${namePart}%` } },
                    { last_name: { [Op.like]: `%${namePart}%` } },
                  ],
                })),
              },
            ],
          },
          required: true,
        },
        {
          model: Cart,
          required: true,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const filteredData = data.filter((item) => {
      const fullName = `${item.student.first_name} ${item.student.last_name}`;
      return fullName.toLowerCase().includes(search.toLowerCase());
    });

    if (filteredData) {
      return res.json(filteredData);
    } else {
      res.status(400).json("No data found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

//route sa pag-export
router.route("/fetchDataForExport").get(async (req, res) => {
  try {
    const data = await Cart.findAll({
      include: [
        {
          model: Order_Transaction,
          required: true,
          include: [
            {
              model: Student,
              required: true,
              include: [
                {
                  model: Student_Balance,
                  required: true,
                },
              ],
            },
          ],
        },
        {
          model: Product_Inventory,
          required: true,
          include: [
            {
              model: Product,
              required: true,
            },
          ],
        },
        {
          model: Cart_Specification_Variant,
          required: false,
          include: [
            {
              model: Specification_Variant,
              required: true,
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    if (data) {
      return res.json(data);
    } else {
      res.status(400).json("No data found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

// For Specific Customer Reports
router.route("/fetchSpecificStudentReport/:id").get(async (req, res) => {
  try {
    const { id } = req.params;

    const data = await Order_Transaction.findAll({
      include: [
        {
          model: Cart,
          required: true,
          include: [
            {
              model: Product_Inventory,
              required: true,
              include: [
                {
                  model: Product,
                  required: true,
                },
              ],
            },
            {
              model: Cart_Specification_Variant,
              required: false,
              include: [
                {
                  model: Specification_Variant,
                  required: true,
                },
              ],
            },
          ],
        },
        {
          model: Student,
          required: true,
        },
      ],
      where: {
        order_transaction_id: id,
      },
    });

    if (data) {
      return res.json(data);
    } else {
      res.status(400).json("No data found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

// For Received Reports
router.route("/getReceiveData").get(async (req, res) => {
  try {
    const data = await Inventory_Receiving_Transaction.findAll({
      include: [
        {
          model: Receiving_Stock_Inventory,
          required: true,
        },
        {
          model: Product_Inventory_Accumulate,
          required: true,
          include: [
            {
              model: Product_Inventory,
              required: true,
              include: [
                {
                  model: Product,
                  required: true,
                },
                // {
                //   model: Category_Product,
                //   required: true,
                //   include: [
                //     {
                //       model: Product,
                //       required: true,
                //     },
                //     {
                //       model: Category,
                //       required: true,
                //     },
                //   ],
                // },
              ],
            },
          ],
        },
      ],
    });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    if (data) {
      return res.json(data);
    } else {
      res.status(400);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

// Raw Mats Received
router.route("/getReceiveRawData").get(async (req, res) => {
  try {
    const data = await Raw_Inventory_Receiving_Transaction.findAll({
      include: [
        {
          model: Receiving_Stock_Inventory,
          required: true,
        },
        {
          model: Raw_Inventory_Accumulate,
          required: true,
          include: [
            {
              model: RawInventory,
              required: true,
              include: [
                {
                  model: RawMaterial,
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    });

    if (data) {
      return res.json(data);
    } else {
      res.status(400);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/getOutboundRawData").get(async (req, res) => {
  try {
    const data = await Raw_Inventory_Outbound_Transaction.findAll({
      include: [
        {
          model: Outbound_Stock_Inventory,
          required: true,
        },
        {
          model: Raw_Inventory_Outbound,
          required: true,
          include: [
            {
              model: RawInventory,
              required: true,
              include: [
                {
                  model: RawMaterial,
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    });

    if (data) {
      return res.json(data);
    } else {
      res.status(400);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/getCountRawData").get(async (req, res) => {
  try {
    const data = await Raw_Inventory_Counting_Transaction.findAll({
      include: [
        {
          model: Stock_Counting_Inventory,
          required: true,
        },
        {
          model: Raw_Inventory_Counting,
          required: true,
          include: [
            {
              model: RawInventory,
              required: true,
              include: [
                {
                  model: RawMaterial,
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    });

    if (data) {
      return res.json(data);
    } else {
      res.status(400);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

// For Outbound Reports
router.route("/getOutboundData").get(async (req, res) => {
  try {
    const data = await Inventory_Outbound_Transaction.findAll({
      include: [
        {
          model: Outbound_Stock_Inventory,
          required: true,
        },
        {
          model: Product_Inventory_Outbound,
          required: true,
          include: [
            {
              model: Product_Inventory,
              required: true,
              include: [
                {
                  model: Product,
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    });

    if (data) {
      return res.json(data);
    } else {
      res.status(400);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

// For Outbound Reports
router.route("/getCountingData").get(async (req, res) => {
  try {
    const data = await Inventory_Stock_Counting_Transaction.findAll({
      include: [
        {
          model: Stock_Counting_Inventory,
          required: true,
        },
        {
          model: Product_Inventory_Counting,
          required: true,
          include: [
            {
              model: Product_Inventory,
              required: true,
              include: [
                {
                  model: Product,
                  required: true,
                },
                // {
                //   model: Category_Product,
                //   required: true,
                //   include: [
                //     {
                //       model: Product,
                //       required: true,
                //     },
                //     {
                //       model: Category,
                //       required: true,
                //     },
                //   ],
                // },
              ],
            },
          ],
        },
      ],
    });

    if (data) {
      return res.json(data);
    } else {
      res.status(400);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/getBulkHistory").get(async (req, res) => {
  try {
    const data = await Bulk_Load.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: MasterList,
          required: true,
        },
      ],
    });

    if (data) {
      return res.json(data);
    } else {
      res.status(400);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/inventoryReport").get(async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // const allCart = await Cart.findAll({
    //   attributes: [
    //     "product_inventory_id",
    //     [Sequelize.fn("SUM", Sequelize.col("Cart.quantity")), "total_quantity"],
    //   ],
    //   where: {
    //     createdAt: {
    //       [Op.between]: [startOfToday, endOfToday],
    //     },
    //   },
    //   group: ["product_inventory_id"],
    //   include: [
    //     {
    //       model: Product_Inventory,
    //       attributes: ["product_inventory_id", "product_id", "quantity"],
    //       include: [
    //         {
    //           model: Product,
    //           required: true,
    //           attributes: ["product_id", "name", "sku"],
    //           include: [
    //             {
    //               model: Category_Product,
    //               required: false,
    //               attributes: [
    //                 ""
    //               ]
    //             }
    //           ]
    //         },
    //       ],
    //     },
    //   ],
    // });

    // const allCart = await Cart.findAll({
    //   attributes: [
    //     "product_inventory_id",
    //     [Sequelize.fn("SUM", Sequelize.col("Cart.quantity")), "total_quantity"],
    //   ],
    //   where: {
    //     createdAt: {
    //       [Op.between]: [startOfToday, endOfToday],
    //     },
    //   },
    //   group: ["product_inventory_id"],
    // });

    const allCartData = await Cart.findAll({
      attributes: ["product_inventory_id", "quantity"],
      where: {
        createdAt: {
          [Op.between]: [startOfToday, endOfToday],
        },
      },
    });

    // Aggregate the quantities manually
    const aggregatedCart = allCartData.reduce((acc, item) => {
      if (acc[item.product_inventory_id]) {
        acc[item.product_inventory_id].total_quantity += item.quantity;
      } else {
        acc[item.product_inventory_id] = {
          product_inventory_id: item.product_inventory_id,
          total_quantity: item.quantity,
        };
      }
      return acc;
    }, {});

    // Fetch all detailed data
    const allCartDetails = await Cart.findAll({
      where: {
        createdAt: {
          [Op.between]: [startOfToday, endOfToday],
        },
      },
      include: [
        {
          model: Product_Inventory,
          include: [
            {
              model: Product,
              required: true,
              include: [
                {
                  model: Category_Product,
                  required: true,
                  include: [
                    {
                      model: Category,
                      required: true,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    const combinedResults = allCartDetails.map((detailItem) => {
      const aggregatedItem =
        aggregatedCart[detailItem.product_inventory_id] || {};
      const productInventory = detailItem.product_inventory;
      const product = productInventory ? productInventory.product : null;
      const category_product = product ? product.category_products[0] : null;
      const categ = category_product ? category_product.category : null;

      return {
        product_inventory: {
          product: {
            sku: product ? product.sku : null,
            name: product ? product.name : null,
          },
          category: categ ? categ.name : null,
          quantity: productInventory ? productInventory.quantity : null,
        },
        total_quantity: aggregatedItem.total_quantity || 0,
      };
    });

    console.log("Combined", combinedResults);
    if (combinedResults) {
      return res.json(combinedResults);
    } else {
      res.status(400);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/getBulkTransaction").get(async (req, res) => {
  try {
    const { bulkID } = req.query;

    const data = await Bulk_Load_Transaction.findAll({
      include: [
        {
          model: Bulk_Load,
          required: true,
        },
        {
          model: Load_Transaction,
          required: true,
          include: [
            {
              model: Student_Balance,
              required: true,
              include: [
                {
                  model: Student,
                  required: true,
                },
              ],
            },
          ],
        },
      ],
      where: {
        bulk_load_id: bulkID,
      },
    });

    if (data) {
      return res.json(data);
    } else {
      res.status(400);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/raw-mats-report").get(async (req, res) => {
  try {
    const data = await RawInventory.findAll({
      include: [
        {
          model: RawMaterial,
          required: true,
        },
      ],
    });

    if (data) {
      return res.json(data);
    } else {
      res.status(400);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/operate-report").get(async (req, res) => {
  try {
    const data = await Store_Status_History.findAll({
      include: [
        {
          model: MasterList,
          required: true,
        },
      ],
    });

    if (data) {
      return res.json(data);
    } else {
      res.status(400);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/store-report").get(async (req, res) => {
  try {
    const data = await Store_Report.findAll({});

    if (data) {
      return res.json(data);
    } else {
      res.status(400);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

//route if si user clinick yung export button sa Inventory Reports
router.route("/exportReports").post(async (req, res) => {
  try {
    const { selectedPage, format, userId } = req.body;
    await Activity_Log.create({
      masterlist_id: userId,
      action_taken: `Reports: Export ${format} file for ${selectedPage} reports.`,
    });
    res.status(200).send("Activity Log successfully");
  } catch (error) {
    console.error("Error adding stock:", error);
    res.status(500).send("An error occurred while adding stock");
  }
});

//for pos reports logs
router.route("/posReportsLog").post(async (req, res) => {
  try {
    const { format, userId } = req.body;
    await Activity_Log.create({
      masterlist_id: userId,
      action_taken: `Reports: Export ${format} file for POS reports.`,
    });
    res.status(200).send("Activity Log successfully");
  } catch (error) {
    console.error("Error adding stock:", error);
    res.status(500).send("An error occurred while adding stock");
  }
});

router.route("/storeReportLog").post(async (req, res) => {
  try {
    const { format, userId } = req.body;
    await Activity_Log.create({
      masterlist_id: userId,
      action_taken: `Reports: Export ${format} file for Store Reports reports.`,
    });
    res.status(200).send("Activity Log successfully");
  } catch (error) {
    console.error("Error adding stock:", error);
    res.status(500).send("An error occurred while adding stock");
  }
});

router.route("/endLog").post(async (req, res) => {
  try {
    const { format, userId } = req.body;
    await Activity_Log.create({
      masterlist_id: userId,
      action_taken: `Reports: Export ${format} file for End Shift Reports.`,
    });
    res.status(200).send("Activity Log successfully");
  } catch (error) {
    console.error("Error adding stock:", error);
    res.status(500).send("An error occurred while adding stock");
  }
});

//for RFID report logs
router.route("/rfidReportsLog").post(async (req, res) => {
  try {
    const { format, userId } = req.body;
    await Activity_Log.create({
      masterlist_id: userId,
      action_taken: `Reports: Export ${format} file for RFID reports.`,
    });
    res.status(200).send("Activity Log successfully");
  } catch (error) {
    console.error("Error adding stock:", error);
    res.status(500).send("An error occurred while adding stock");
  }
});

//for Raw Materials report logs
router.route("/rawMatsReportLog").post(async (req, res) => {
  try {
    const { format, userId } = req.body;
    await Activity_Log.create({
      masterlist_id: userId,
      action_taken: `Reports: Export ${format} file for Raw Materials reports.`,
    });
    res.status(200).send("Activity Log successfully");
  } catch (error) {
    console.error("Error adding stock:", error);
    res.status(500).send("An error occurred while adding stock");
  }
});

//customer report excel logs
router.route("/customerExcelReportsLog").post(async (req, res) => {
  try {
    const { userId } = req.body;
    await Activity_Log.create({
      masterlist_id: userId,
      action_taken: `Reports: Export excel file for Customer reports.`,
    });
    res.status(200).send("Activity Log successfully");
  } catch (error) {
    console.error("Error adding stock:", error);
    res.status(500).send("An error occurred while adding stock");
  }
});

//customer report pdf logs
router.route("/customerPDFReportsLog").post(async (req, res) => {
  try {
    const { userId } = req.body;
    await Activity_Log.create({
      masterlist_id: userId,
      action_taken: `Reports: Export pdf file for Customer reports.`,
    });
    res.status(200).send("Activity Log successfully");
  } catch (error) {
    console.error("Error adding stock:", error);
    res.status(500).send("An error occurred while adding stock");
  }
});

// Fetch Bulk Data for Export
router.route("/fetchBulkData").get(async (req, res) => {
  try {
    const data = await Bulk_Load_Transaction.findAll({
      include: [
        {
          model: Bulk_Load,
          required: true,
          include: [
            {
              model: MasterList,
              required: true,
            },
          ],
        },
        {
          model: Load_Transaction,
          required: true,
          include: [
            {
              model: Student_Balance,
              required: true,
              include: [
                {
                  model: Student,
                  required: true,
                },
              ],
            },
          ],
        },
      ],
    });

    console.log("sssssssssssssssssssss", data);
    if (data) {
      return res.json(data);
    } else {
      res.status(400).json("No data found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/bulkLog").post(async (req, res) => {
  try {
    const { userId, type } = req.body;
    await Activity_Log.create({
      masterlist_id: userId,
      action_taken: `Reports: Export ${type} file for Bulk Load reports.`,
    });
    res.status(200).send("Activity Log successfully");
  } catch (error) {
    console.error("Error adding stock:", error);
    res.status(500).send("An error occurred while adding stock");
  }
});

router.route("/creditReports").get(async (req, res) => {
  try {
    const { fromDate, endDate } = req.query;
    const data = await Credit_Student_Meal.findAll({
      include: [
        {
          model: Student,
          required: true,
          where: {
            credit_enable: {
              [Op.ne]: false,
            },
            status: {
              [Op.ne]: "Inactive",
            },
          },
        },
      ],
      where: {
        date_valid: {
          [Op.between]: [fromDate, endDate],
        },
      },
    });

    if (data) {
      return res.json(data);
    } else {
      res.status(400);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/weekCreditReport").get(async (req, res) => {
  try {
    const mealData = await Credit_Student_Meal.findAll({
      attributes: [
        "date_valid",
        "approver",
        "requestor",
        "date_approved",
        "credit_price",
      ],
      where: {
        status: "Approved",
      },
      include: [
        {
          model: MasterList,
          as: "ApprovedBy",
          attributes: ["col_id", "col_name"],
        },
        {
          model: MasterList,
          as: "RequestBy",
          attributes: ["col_id", "col_name"],
        },
      ],
      order: [["date_valid", "ASC"]],
    });

    // Step 2: Group data by 7-day ranges
    let groupedData = [];
    let group = [];
    let startDate = null;

    mealData.forEach((entry, index) => {
      if (!startDate) {
        startDate = new Date(entry.date_valid); // Start a new group with the first date
      }

      const currentDate = new Date(entry.date_valid);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // Create a 7-day window

      // If the current date is within the 7-day range, add it to the group
      if (currentDate <= endDate) {
        group.push(entry);
      } else {
        // Push the completed group into the result array
        groupedData.push({
          date_from: startDate.toISOString().slice(0, 10),
          date_to: endDate.toISOString().slice(0, 10),
          approver: group[0].ApprovedBy.col_name,
          requestor: group[0].RequestBy.col_name,
          date_approved: group[0].date_approved,
          credit_price: group[0].credit_price,
        });

        // Start a new group
        group = [entry];
        startDate = currentDate;
      }

      // If this is the last entry, push the final group
      if (index === mealData.length - 1 && group.length > 0) {
        const finalEndDate = new Date(startDate);
        finalEndDate.setDate(startDate.getDate() + 6);

        groupedData.push({
          date_from: startDate.toISOString().slice(0, 10),
          date_to: finalEndDate.toISOString().slice(0, 10),
          approver: group[0].ApprovedBy.col_name,
          requestor: group[0].RequestBy.col_name,
          date_approved: group[0].date_approved,
          credit_price: group[0].credit_price,
        });
      }
    });
    groupedData.reverse();
    // Step 3: Return the grouped data to your frontend
    res.json(groupedData);
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/weekCreditReportSpecific").get(async (req, res) => {
  try {
    const { fromDate, endDate } = req.query;

    console.log(fromDate, endDate);
    const data = await Credit_Student_Meal.findAll({
      include: [
        {
          model: Student,
          required: true,
          where: {
            credit_enable: {
              [Op.ne]: false,
            },
            status: {
              [Op.ne]: "Inactive",
            },
          },
        },
      ],
      where: {
        date_valid: {
          [Op.between]: [fromDate, endDate],
        },
      },
      order: [["date_valid", "ASC"]],
    });

    if (data) {
      return res.json(data);
    } else {
      res.status(400);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/weekCreditToExport").get(async (req, res) => {
  try {
    const { filteredTransactions, userId, format } = req.query;
    filteredTransactions.reverse();
    let dateFrom;
    let dateTo;

    if (filteredTransactions.length === 1) {
      dateFrom = filteredTransactions[0].date_from;
      dateTo = filteredTransactions[0].date_to;
    } else if (filteredTransactions.length > 1) {
      dateFrom = filteredTransactions[0].date_from;
      dateTo = filteredTransactions[filteredTransactions.length - 1].date_to;
    }

    console.log(dateFrom, dateTo);
    const data = await Credit_Student_Meal.findAll({
      include: [
        {
          model: Student,
          required: true,
        },
        {
          model: MasterList,
          as: "ApprovedBy",
          attributes: ["col_id", "col_name"],
        },
        {
          model: MasterList,
          as: "RequestBy",
          attributes: ["col_id", "col_name"],
        },
      ],
      where: {
        date_valid: {
          [Op.between]: [dateFrom, dateTo],
        },
        status: "Approved",
      },
      order: [["date_valid", "ASC"]],
    });

    await Activity_Log.create({
      masterlist_id: userId,
      action_taken: `Reports: Export ${format} file for Weekly Credit reports.`,
    });

    if (data) {
      return res.json(data);
    } else {
      res.status(400);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/endShiftReports").get(async (req, res) => {
  try {
    const data = await CashierReport.findAll({});

    if (data) {
      return res.json(data);
    } else {
      res.status(400);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

module.exports = router;
