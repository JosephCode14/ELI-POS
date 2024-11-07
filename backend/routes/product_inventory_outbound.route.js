const router = require("express").Router();
const { where, Op, literal } = require("sequelize");
const sequelize = require("../db/config/sequelize.config");
const {
  Product_Inventory_Outbound,
  Product_Inventory,
  Outbound_Stock_Inventory,
  Inventory_Outbound_Transaction,
  Product,
  Transaction_Number,
  Category_Product,
  Category,
  Activity_Log
} = require("../db/models/associations");

router.route("/outboundStocks").post(async (req, res) => {
  try {
    const { transactionNumber, remarks, outboundData, userId } = req.body;

    const newDataOutbound = await Outbound_Stock_Inventory.create({
      transaction_number_id: transactionNumber,
      remarks: remarks,
      type: "product",
    });

    const outboundInventoryId = newDataOutbound.outbound_stock_inventory_id;

    for (const item of outboundData) {
      const { product_id, quantity, type } = item;

      const inventory = await Product_Inventory.findOne({
        where: {
          product_id: product_id,
        },
      });

      if (inventory) {
        const existingQTY = inventory.quantity;

        const newProductOutbound = await Product_Inventory_Outbound.create({
          product_inventory_id: inventory.product_inventory_id,
          old_quantity: existingQTY,
          new_quantity: existingQTY - quantity,
          type: type,
          outbound_quantity: quantity,
        });

        const newIdOutbound = newProductOutbound.product_inventory_outbound_id;

        if (newProductOutbound) {
          await inventory.update({
            quantity: existingQTY - quantity,
          });
        }

        await Inventory_Outbound_Transaction.create({
          outbound_stock_inventory_id: outboundInventoryId,
          product_inventory_outbound_id: newIdOutbound,
        });

      const findProducts = await Product_Inventory.findAll({
        where: {
          product_inventory_id: inventory.product_inventory_id 
        },
        include: [
          {
            model: Product,
            required: true,
          },
        ],
      });

      const productNames = findProducts.map(pi => pi.product.name);


      for (const productName of productNames) {
        await Activity_Log.create({
          masterlist_id: userId,
          action_taken: `Product Inventory: Outbound stock for product ${productName} with quantity of ${quantity} as it is for ${type}`,
        });
      }
      }
    }

    const transaction = await Transaction_Number.findByPk(1);

    const currentTransacCounter = parseInt(transaction.transaction_counter, 10);
    const increment = currentTransacCounter + 1;
    const incrementedCounter = String(increment).padStart(3, "0");

    await transaction.update({ transaction_counter: incrementedCounter });
    res.status(200).json("Stock added successfully");
  } catch (error) {
    console.error("Error outbound stock:", error);
    res.status(500).send("An error occurred while outbound stock");
  }
});

router.route("/getOutboundData").get(async (req, res) => {
  try {
    const data = await Outbound_Stock_Inventory.findAll({
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

router.route("/modalProductOutbound").get(async (req, res) => {
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
      where: {
        outbound_stock_inventory_id: req.query.outboundStockInventoryId,
      },
    });

    if (data.length > 0) {
      res.json(data);
    } else {
      res.status(404).json({
        message: "No data found for the given outboundStockInventoryId",
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

    const data = await Outbound_Stock_Inventory.findAll({
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
