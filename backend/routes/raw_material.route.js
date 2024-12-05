const router = require("express").Router();
const { where, Op } = require("sequelize");
const sequelize = require("../db/config/sequelize.config");
const {
  Archive_Raw,
  Category,
  RawMaterial,
  Dish_Raw_Material,
  RawInventory,
  Receiving_Stock_Inventory,
  Inventory_Receiving_Transaction,
  Raw_Inventory_Accumulate,
  Raw_Inventory_Receiving_Transaction,
  Outbound_Stock_Inventory,
  Raw_Inventory_Outbound_Transaction,
  Raw_Inventory_Outbound,
  Stock_Counting_Inventory,
  Raw_Inventory_Counting,
  Raw_Inventory_Counting_Transaction,
  Transaction_Number,
  Activity_Log,
} = require("../db/models/associations");
const Archive = require("../db/models/archive.model");
const Raw_Inventory = require("../db/models/raw_inventory.model");

router.route("/create").post(async (req, res) => {
  try {
    const {
      sku,
      materialName,
      description,
      unitType,
      unitPrice,
      threshold,
      userId,
    } = req.body;

    const existingProduct = await RawMaterial.findOne({
      where: {
        material_name: materialName,
      },
    });

    if (existingProduct) {
      return res.status(201).send("Exist");
    } else {
      const newData = await RawMaterial.create({
        sku: sku,
        material_name: materialName,
        description: description,
        unit_type: unitType,
        unit_price: unitPrice,
        threshold: threshold,
      });

      if (newData) {
        const newInventory = await RawInventory.create({
          raw_id: newData.raw_material_id,
          quantity: 0,
        });
      }
      await Activity_Log.create({
        masterlist_id: userId,
        action_taken: `Raw Material: Create a new raw material named ${materialName}`,
      });
      res.status(200).json(newData);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred");
  }
});

// USED MODULE:
// Raw Material dropdown
router.route("/getRawmaterial").get(async (req, res) => {
  try {
    const data = await RawInventory.findAll({
      include: [
        {
          model: RawMaterial,
          required: true,
        },
      ],
      where: {
        quantity: {
          [Op.ne]: 0,
        },
      },
      order: [["createdAt", "DESC"]],
    });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

// USED MODULE:
// Inventory Receiving RawMaterial - ginamit din sa inventory ng raw materials
router.route("/getRawInventory").get(async (req, res) => {
  try {
    const data = await RawInventory.findAll({
      include: [
        {
          model: RawMaterial,
          required: true,
        },
      ],
    });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

//raw materials table data
router.route("/rawMaterialData").get(async (req, res) => {
  try {
    const data = await RawMaterial.findAll({
      where: {
        is_archived: false,
      },
      order: [["createdAt", "DESC"]],
    });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});
//raw materials table data

router.route("/updateRawmaterial").post(async (req, res) => {
  try {
    const {
      rawMaterialId,
      sku,
      materialName,
      description,
      threshold,
      unitType,
      unitPrice,
      // selectedCategory,
      userId,
    } = req.body;

    const isExist = await RawMaterial.findOne({
      where: {
        material_name: materialName,
        raw_material_id: { [Op.ne]: rawMaterialId },
      },
    });

    if (isExist) {
      return res.status(201).json();
    } else {
      const existingMaterial = await RawMaterial.findOne({
        where: { raw_material_id: rawMaterialId },
      });

      let actionMessage = "Raw Material: Update ";

      const changes = [];

      if (existingMaterial.material_name !== materialName) {
        changes.push(
          `raw material name from ${existingMaterial.material_name} to ${materialName}`
        );
      }
      if (existingMaterial.sku !== sku) {
        changes.push(`SKU from ${existingMaterial.sku} to ${sku}`);
      }
      if (existingMaterial.description !== description) {
        changes.push(
          `description from ${existingMaterial.description} to ${description}`
        );
      }
      if (existingMaterial.threshold !== threshold) {
        changes.push(
          `threshold from ${existingMaterial.threshold} to ${threshold}`
        );
      }
      if (existingMaterial.unit_type !== unitType) {
        changes.push(
          `unit type from ${existingMaterial.unit_type} to ${unitType}`
        );
      }
      if (existingMaterial.unit_price !== unitPrice) {
        changes.push(
          `unit price from ${existingMaterial.unit_price} to ${unitPrice}`
        );
      }

      actionMessage += changes.join(", ");

      const isCreated = await RawMaterial.update(
        {
          sku: sku,
          material_name: materialName,
          description: description,
          threshold: threshold,
          unit_type: unitType,
          unit_price: unitPrice,
        },
        {
          where: {
            raw_material_id: rawMaterialId,
          },
        }
      );

      await Activity_Log.create({
        masterlist_id: userId,
        action_taken: actionMessage,
      });

      if (isCreated) {
        return res.status(200).json();
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/addStocks").post(async (req, res) => {
  try {
    const { productDetails, transactionNumber, remarks, userId } = req.body;

    // Create a new receiving stock inventory entry
    const newdataReceive = await Receiving_Stock_Inventory.create({
      transaction_number_id: transactionNumber,
      remarks: remarks,
      type: "Raw",
    });

    const receivingStockInventoryId =
      newdataReceive.receiving_stock_inventory_id;

    for (const product of productDetails) {
      const { raw_inventory_id, quantity, totalPrice } = product;

      const inventory = await Raw_Inventory.findOne({
        where: {
          id: raw_inventory_id,
        },
      });

      if (inventory) {
        const existingQTY = inventory.quantity;

        const newProductAccumulate = await Raw_Inventory_Accumulate.create({
          raw_inventory_id: raw_inventory_id,
          old_quantity: existingQTY,
          new_quantity: existingQTY + quantity,
          total_price: totalPrice,
          quantity_received: quantity,
        });

        const newIdAccumulate = newProductAccumulate.id;

        if (newProductAccumulate) {
          await RawInventory.update(
            {
              quantity: existingQTY + quantity,
            },
            {
              where: {
                id: raw_inventory_id,
              },
            }
          );
        }

        await Raw_Inventory_Receiving_Transaction.create({
          receiving_stock_inventory_id: receivingStockInventoryId,
          raw_inventory_accumulate_id: newIdAccumulate,
        });

        const findRaw = await RawInventory.findAll({
          where: {
            id: raw_inventory_id,
          },
          include: [
            {
              model: RawMaterial,
              required: true,
            },
          ],
        });
        const rawNames = findRaw.map((pi) => pi.raw_material.material_name);

        for (const rawmaterialName of rawNames) {
          await Activity_Log.create({
            masterlist_id: userId,
            action_taken: `Raw Material Inventory: Add stock for raw material ${rawmaterialName} with quantity of ${quantity}`,
          });
        }
      }
    }

    const transaction = await Transaction_Number.findByPk(1);

    const currentTransacCounter = parseInt(transaction.transaction_counter, 10);
    const increment = currentTransacCounter + 1;
    const incrementedCounter = String(increment).padStart(3, "0");

    await transaction.update({ transaction_counter: incrementedCounter });
    res.status(200).send("Stock added successfully");
  } catch (error) {
    console.error("Error adding stock:", error);
    res.status(500).send("An error occurred while adding stock");
  }
});

router.route("/decreaseStock").post(async (req, res) => {
  try {
    const { rawMaterials, transactionNumber, remarks, userId } = req.body;

    const newdataReceive = await Outbound_Stock_Inventory.create({
      transaction_number_id: transactionNumber,
      remarks: remarks,
      type: "Raw",
    });

    const outboundStockInventoryId = newdataReceive.outbound_stock_inventory_id;

    for (const rawMats of rawMaterials) {
      const { id, quantity, type } = rawMats;

      const inventory = await Raw_Inventory.findOne({
        where: {
          raw_id: id,
        },
      });

      if (inventory) {
        const existingQTY = inventory.quantity;

        const newProductAccumulate = await Raw_Inventory_Outbound.create({
          raw_id: id,
          old_quantity: existingQTY,
          new_quantity: existingQTY - quantity,
          type: type,
          outbound_quantity: quantity,
        });

        const newIdAccumulate = newProductAccumulate.raw_inventory_outbound_id;

        if (newProductAccumulate) {
          await RawInventory.update(
            {
              quantity: existingQTY - quantity,
            },
            {
              where: {
                raw_id: id,
              },
            }
          );
        }

        await Raw_Inventory_Outbound_Transaction.create({
          outbound_stock_inventory_id: outboundStockInventoryId,
          raw_inventory_outbound_id: newIdAccumulate,
        });
        const findRaw = await RawInventory.findAll({
          where: {
            id: id,
          },
          include: [
            {
              model: RawMaterial,
              required: true,
            },
          ],
        });
        const rawNames = findRaw.map((pi) => pi.raw_material.material_name);

        for (const rawmaterialName of rawNames) {
          await Activity_Log.create({
            masterlist_id: userId,
            action_taken: `Raw Material Inventory: Outbound stock for raw material ${rawmaterialName} with quantity of ${quantity} as it is for ${type}`,
          });
        }
      }
    }

    const transaction = await Transaction_Number.findByPk(1);

    const currentTransacCounter = parseInt(transaction.transaction_counter, 10);
    const increment = currentTransacCounter + 1;
    const incrementedCounter = String(increment).padStart(3, "0");

    await transaction.update({ transaction_counter: incrementedCounter });

    res.status(200).send("Decrease successfully");
  } catch (error) {
    console.error("Error adding stock:", error);
    res.status(500).send("An error occurred while adding stock");
  }
});

router.route("/stockCounting").post(async (req, res) => {
  try {
    const { stockCountingData, transactionNumber, remarks, userId } = req.body;

    const newdataReceive = await Stock_Counting_Inventory.create({
      transaction_number_id: transactionNumber,
      remarks: remarks,
      type: "Raw",
    });

    const receivingStockInventoryId =
      newdataReceive.stock_counting_inventory_id;

    for (const product of stockCountingData) {
      const { raw_id, systemCount, actualQuantity, loss } = product;

      const inventory = await Raw_Inventory.findOne({
        where: {
          raw_id: raw_id,
        },
      });

      if (inventory) {
        const newProductAccumulate = await Raw_Inventory_Counting.create({
          raw_id: raw_id,
          system_count: systemCount,
          actual_count: actualQuantity,
          stock_loss: loss,
        });

        const newIdAccumulate = newProductAccumulate.raw_inventory_counting_id;

        await Raw_Inventory_Counting_Transaction.create({
          stock_counting_inventory_id: receivingStockInventoryId,
          raw_inventory_counting_id: newIdAccumulate,
        });
      }

      const findRaw = await RawInventory.findAll({
        where: {
          id: raw_id,
        },
        include: [
          {
            model: RawMaterial,
            required: true,
          },
        ],
      });
      const rawNames = findRaw.map((pi) => pi.raw_material.material_name);

      for (const rawmaterialName of rawNames) {
        await Activity_Log.create({
          masterlist_id: userId,
          action_taken: `Raw Material Inventory: Stock counting for raw material ${rawmaterialName} system counts is ${systemCount} and actual counts ${actualQuantity} with ${loss} total of loss.`,
        });
      }
    }

    const transaction = await Transaction_Number.findByPk(1);

    const currentTransacCounter = parseInt(transaction.transaction_counter, 10);
    const increment = currentTransacCounter + 1;
    const incrementedCounter = String(increment).padStart(3, "0");

    await transaction.update({ transaction_counter: incrementedCounter });
    res.status(200).send("Count successfully");
  } catch (error) {
    console.error("Error adding stock:", error);
    res.status(500).send("An error occurred while adding stock");
  }
});

router.route("/modalProductReceivedStock").get(async (req, res) => {
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

// Outbound
router.route("/modalProductOutboundStock").get(async (req, res) => {
  try {
    const { outboundStockInventoryId } = req.query;

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
      where: {
        outbound_stock_inventory_id: outboundStockInventoryId,
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

// Counting
router.route("/modalRawCounting").get(async (req, res) => {
  try {
    const { stockInventoryCountingId } = req.query;

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
      where: {
        stock_counting_inventory_id: stockInventoryCountingId,
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

//raw archive
router.route("/archive").put(async (req, res) => {
  try {
    const { rawIds, remarksArchive, userId } = req.body;

    const rawMaterials = await RawMaterial.findAll({
      where: {
        raw_material_id: rawIds,
      },
    });

    await RawMaterial.update(
      {
        is_archived: true,
      },
      {
        where: { raw_material_id: rawIds },
      }
    );

    for (const rawMaterial of rawMaterials) {
      await Archive_Raw.create({
        archive_raw_time: new Date(),
        remarks: remarksArchive,
        raw_material_id: rawMaterial.raw_material_id,
      });

      await Activity_Log.create({
        masterlist_id: userId,
        action_taken: `Raw Material: Archived. Name: ${rawMaterial.material_name}, SKU: ${rawMaterial.sku}`,
      });
    }

    res.status(200).send("Raw materials archived successfully");
  } catch (error) {
    console.error("Error archiving raw materials:", error);
    res.status(500).send("An error occurred while archiving raw materials");
  }
});

router.route("/get-archiveraw").get(async (req, res) => {
  try {
    const data = await Archive_Raw.findAll({
      include: {
        model: RawMaterial,
        required: true,
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

router.route("/un-archive/:id").put(async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId;

    const raw = await RawMaterial.findOne({
      where: { raw_material_id: id },
    });

    const rawName = raw.material_name;
    const rawSKU = raw.sku;

    await raw.update({
      is_archived: false,
    });

    await Archive_Raw.destroy({
      where: {
        raw_material_id: id,
      },
    });

    await Activity_Log.create({
      masterlist_id: userId,
      action_taken: `Raw Material: Retrived. Name: ${rawName}, SKU: ${rawSKU}`,
    });
    res.send("UnArch");
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});
module.exports = router;
