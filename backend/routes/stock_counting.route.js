const router = require("express").Router();
const { where, Op, literal } = require("sequelize");
const sequelize = require("../db/config/sequelize.config");
const {
  Inventory_Stock_Counting_Transaction,
  Product_Inventory_Counting,
  Stock_Counting_Inventory,
  Product_Inventory,
  Product,
  Transaction_Number,
  Category_Product,
  Category,
  Activity_Log,
} = require("../db/models/associations");

router.route("/stockcountingProcess").post(async (req, res) => {
  try {
    const { transactionNumber, remarks, stockCountingData, userId } = req.body;

    const newStockCountingData = await Stock_Counting_Inventory.create({
      transaction_number_id: transactionNumber,
      remarks: remarks,
      type: "Product",
    });

    const stockCountingId = newStockCountingData.stock_counting_inventory_id;

    for (const item of stockCountingData) {
      const { product_id, quantity, loss } = item;

      const inventory = await Product_Inventory.findOne({
        where: {
          product_id: product_id,
        },
      });

      if (inventory) {
        const existingQTY = inventory.quantity;

        const newStockProductCounting = await Product_Inventory_Counting.create(
          {
            product_inventory_id: inventory.product_inventory_id,
            system_count: existingQTY,
            actual_count: quantity,
            stock_loss: loss,
          }
        );

        const newIdStockCounting =
          newStockProductCounting.product_inventory_counting_id;

        await Inventory_Stock_Counting_Transaction.create({
          stock_counting_inventory_id: stockCountingId,
          product_inventory_counting_id: newIdStockCounting,
        });
        const findProducts = await Product_Inventory.findAll({
          where: {
            product_inventory_id: inventory.product_inventory_id,
          },
          include: [
            {
              model: Product,
              required: true,
            },
          ],
        });

        await inventory.update({
          quantity: quantity,
        });

        const productNames = findProducts.map((pi) => pi.product.name);

        for (const productName of productNames) {
          await Activity_Log.create({
            masterlist_id: userId,
            action_taken: `Product Inventory: Stock counting for product ${productName} system counts is ${existingQTY} and actual counts ${quantity} with ${loss} total of loss.`,
          });
        }
      }
    }

    const transaction = await Transaction_Number.findByPk(1);

    const currentTransacCounter = parseInt(transaction.transaction_counter, 10);
    const increment = currentTransacCounter + 1;
    const incrementedCounter = String(increment).padStart(3, "0");

    await transaction.update({ transaction_counter: incrementedCounter });
    res.status(200).json("Stock counting added successfully");
  } catch (error) {
    console.error("Error stock counting:", error);
    res.status(500).send("An error occurred while stock counting");
  }
});

router.route("/getStockCountingData").get(async (req, res) => {
  try {
    const data = await Stock_Counting_Inventory.findAll({
      order: [["createdAt", "DESC"]],
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

router.route("/modalStockCountingDetails").get(async (req, res) => {
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
              ],
            },
          ],
        },
      ],
      where: {
        stock_counting_inventory_id: req.query.stockInventoryCountingId,
      },
    });

    if (data.length > 0) {
      res.json(data);
    } else {
      res.status(404).json({
        message: "No data found for the given stockInventoryCountingId",
      });
    }
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error fetching data", error: err.message });
  }
});

router.route("/getSearchResults/:search").get(async (req, res) => {
  try {
    const { search } = req.params;

    const data = await Stock_Counting_Inventory.findAll({
      where: {
        [Op.or]: [
          {
            transaction_number_id: {
              [Op.like]: `%${search}%`,
            },
          },
          {
            remarks: {
              [Op.like]: `%${search}%`,
            },
          },
          literal(
            `DATE_FORMAT(updatedAt, '%m/%d/%Y, %h:%i %p') LIKE '%${search}%'`
          ),
        ],
      },
    });

    console.log(search);
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
