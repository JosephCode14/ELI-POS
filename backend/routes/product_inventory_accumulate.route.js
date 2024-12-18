const router = require("express").Router();
const { where, Op } = require("sequelize");
const sequelize = require("../db/config/sequelize.config");
const {
  Product_Inventory_Accumulate,
  Product_Inventory,
  Receiving_Stock_Inventory,
  Inventory_Receiving_Transaction,
  Product,
  Transaction_Number,
  Category_Product,
  Category,
  Raw_Inventory_Receiving_Transaction,
  Raw_Inventory_Accumulate,
  RawInventory,
  Activity_Log,
} = require("../db/models/associations");

//Receiving Stocks Render
router.route("/getReceivingStockInventory").get(async (req, res) => {
  try {
    const data = await Receiving_Stock_Inventory.findAll({
      include: [
        {
          model: Product_Inventory_Accumulate,
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

// Fetch Product_Inventory_Accumulate
router.route("/getProductInventoryAccumulate").get(async (req, res) => {
  try {
    const data = await Product_Inventory_Accumulate.findAll();

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

// Fetch ReceivingStockInventory
router.route("/getReceivingStockInventories").get(async (req, res) => {
  try {
    const data = await Receiving_Stock_Inventory.findAll();

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

//Received new stocks for inventory
router.route("/addStocks").post(async (req, res) => {
  try {
    const { productDetails, transactionNumber, remarks, userId } = req.body;

    // Create a new receiving stock inventory entry
    const newdataReceive = await Receiving_Stock_Inventory.create({
      transaction_number_id: transactionNumber,
      remarks: remarks,
      type: "product",
    });

    const receivingStockInventoryId =
      newdataReceive.receiving_stock_inventory_id;

    for (const product of productDetails) {
      const { productId, quantity, totalPrice } = product;

      const inventory = await Product_Inventory.findOne({
        where: {
          product_id: productId,
        },
        include: [
          {
            model: Product,
            required: true,
          },
        ],
      });

      if (inventory) {
        const existingQTY = inventory.quantity;

        const newProductAccumulate = await Product_Inventory_Accumulate.create({
          product_inventory_id: inventory.product_inventory_id,
          old_quantity: existingQTY,
          new_quantity: existingQTY + quantity,
          total_price: totalPrice,
          stocked_price: inventory.product.price,
          quantity_received: quantity,
        });

        const newIdAccumulate =
          newProductAccumulate.product_inventory_accumulate_id;

        if (newProductAccumulate) {
          await inventory.update({
            quantity: existingQTY + quantity,
            quantity_received: quantity,
          });
        }

        await Inventory_Receiving_Transaction.create({
          receiving_stock_inventory_id: receivingStockInventoryId,
          product_inventory_accumulate_id: newIdAccumulate,
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

        const productNames = findProducts.map((pi) => pi.product.name);

        for (const productName of productNames) {
          await Activity_Log.create({
            masterlist_id: userId,
            action_taken: `Product Inventory: Add stock for product ${productName} with quantity of ${quantity}`,
          });
        }
      } else {
        const newInventory = await Product_Inventory.create({
          product_id: productId,
          quantity: quantity,
        });

        if (newInventory) {
          const findNewInventory = await Product_Inventory.findOne({
            where: {
              product_id: newInventory.product_id,
            },
            include: [
              {
                model: Product,
                required: true,
              },
            ],
          });

          const newProdInventory = await Product_Inventory_Accumulate.create({
            product_inventory_id: findNewInventory.product_inventory_id,
            old_quantity: 0,
            new_quantity: quantity,
            total_price: totalPrice,
            stocked_price: findNewInventory.product.price,
            quantity_received: quantity,
          });

          const newIdAccumulate =
            newProdInventory.product_inventory_accumulate_id;

          await Inventory_Receiving_Transaction.create({
            receiving_stock_inventory_id: receivingStockInventoryId,
            product_inventory_accumulate_id: newIdAccumulate,
          });

          const findProducts = await Product_Inventory.findAll({
            where: {
              product_inventory_id: findNewInventory.product_inventory_id,
            },
            include: [
              {
                model: Product,
                required: true,
              },
            ],
          });

          const productNames = findProducts.map((pi) => pi.product.name);

          for (const productName of productNames) {
            await Activity_Log.create({
              masterlist_id: userId,
              action_taken: `Product Inventory: Add stock for product ${productName} with quantity of ${quantity}`,
            });
          }
        }
      }
    }

    // const transaction = await Transaction_Number.findByPk(1);

    // const currentTransacCounter = parseInt(transaction.transaction_counter, 10);
    // const increment = currentTransacCounter + 1;
    // const incrementedCounter = String(increment).padStart(3, "0");

    // await transaction.update({ transaction_counter: incrementedCounter });
    res.status(200).send("Stock added successfully");
  } catch (error) {
    console.error("Error adding stock:", error);
    res.status(500).send("An error occurred while adding stock");
  }
});

// Fetch ReceivingStockInventory Details
router.route("/modalProductReceivedStock").get(async (req, res) => {
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
      where: {
        receiving_stock_inventory_id: req.query.receivedInventoryId,
      },
    });

    if (data.length > 0) {
      res.json(data);
    } else {
      res.status(404).json({
        message: "No data found for the given outboundStockInventoryId",
      });
    }
  } catch (error) {
    console.error("Error fetching stock details:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.route("/get-transaction-number").get(async (req, res) => {
  try {
    const currentDate = new Date();
    const date = currentDate.toISOString().split("T")[0];

    let transaction = await Transaction_Number.findByPk(1);

    if (!transaction) {
      transaction = await Transaction_Number.create({
        transaction_number_id: 1,
        transaction_counter: "001",
        transaction_lastDate: currentDate,
      });
    }

    const lastDateString = transaction.transaction_lastDate
      ? transaction.transaction_lastDate.toISOString().split("T")[0]
      : null;

    let transactionNum;

    if (lastDateString !== date) {
      transaction.transaction_counter = "001";
      transaction.transaction_lastDate = currentDate;
      await transaction.save();
      transactionNum = "001";
    } else {
      transactionNum = transaction.transaction_counter;
    }

    res.json({ transactionNum });
  } catch (error) {
    console.error(error);
    res.status(500).json("Error");
  }
});

module.exports = router;
