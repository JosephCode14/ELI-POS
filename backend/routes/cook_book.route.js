const express = require("express");
const {
  Dish_Raw_Material,
  RawMaterial,
  Cook_Book,
  Cook_Book_Material,
  Product,
  RawInventory,
  Product_Inventory,
  Category_Product,
  Activity_Log,
} = require("../db/models/associations");
const router = express.Router();

const { where, Op } = require("sequelize");

router.route("/create-cook").post(async (req, res) => {
  try {
    const { selectedRawMaterials, selectedDish, cookNumber, userId } = req.body;

    let converted_unit;

    const cookBook = await Cook_Book.create({
      product_id: selectedDish.product_id,
      cook_book_number_id: `CKB${cookNumber}`,
      status: "Active",
      operate: true,
    });

    const cookBookID = cookBook.cook_book_id;

    const product = await Product_Inventory.findOne({
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
        //       where: {
        //         product_id: selectedDish.product_id,
        //       },
        //     },
        //   ],
        // },
      ],
    });

    const productName = product.product.name;
    const rawMaterialLogs = [];

    for (const material of selectedRawMaterials) {
      const conversionRates = {
        L: 1,
        mL: 0.001,
        Kg: 1,
        g: 0.001,
        oz: 0.0295735,
        lbs: 0.453592,
        pcs: 1,
      };

      const gramRates = {
        g: 1,
        oz: 0.035274,
        lbs: 0.00220462,
      };

      const milimeterRates = {
        mL: 1,
        oz: 0.033814,
      };
      const literRates = {
        L: 1,
        mL: 0.001,
        oz: 0.033814,
      };

      const rawMatUnit = material.raw_material.unit_type;
      const selectedRawMatUnit = material.selectedUnit;

      let conversionRate;
      if (rawMatUnit == "g") {
        conversionRate = gramRates[selectedRawMatUnit];
      } else if (rawMatUnit == "mL") {
        conversionRate = milimeterRates[selectedRawMatUnit];
      } else if (rawMatUnit == "L") {
        conversionRate = literRates[selectedRawMatUnit];
      } else {
        conversionRate = conversionRates[selectedRawMatUnit];
      }

      const quantityTOdeduct = material.volume * conversionRate;

      await Dish_Raw_Material.create({
        cook_book_id: cookBookID,
        raw_material_id: material.raw_material.raw_material_id,
        unit: material.selectedUnit,
        average_cost: material.cost,
        volume: material.volume,
        status: "Active",
      });

      const fetchInv = await RawInventory.findAll({
        where: {
          raw_id: material.raw_material.raw_material_id,
        },
      });

      for (const data of fetchInv) {
        // console.log(`${data.id} ${data.quantity}`);
        await RawInventory.update(
          {
            quantity: data.quantity - quantityTOdeduct.toFixed(2),
          },
          {
            where: {
              raw_id: material.raw_material.raw_material_id,
            },
          }
        );
      }

      rawMaterialLogs.push(material.raw_material.material_name);
    }

    const actionMessage = `Cook Book: Create dish named ${productName} with raw materials of ${rawMaterialLogs.join(
      ", "
    )}`;

    await Activity_Log.create({
      masterlist_id: userId,
      action_taken: actionMessage,
    });

    res.status(200).send({ message: "success" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred" });
  }
});

router.route("/fetchProduct").get(async (req, res) => {
  try {
    const exists = await Product.findAll({
      include: [
        {
          model: Cook_Book,
          required: false,
          attributes: [],
          where: { product_id: { [Op.col]: "Product.product_id" } },
        },
      ],
    });

    if (exists) {
      return res.status(201).send({ message: "Exists" });
    } else {
      return res.status(200).send({ message: "Not exists" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred" });
  }
});

router.route("/checkDish/:id").get(async (req, res) => {
  try {
    const { id } = req.params;

    const exists = await Cook_Book.findOne({
      where: {
        product_id: id,
      },
    });

    if (exists) {
      return res.status(201).send({ message: "Exists" });
    } else {
      return res.status(200).send({ message: "Not exists" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred" });
  }
});

router.route("/fetchCookBook").get(async (req, res) => {
  try {
    const data = await Cook_Book.findAll({
      include: [
        {
          model: Dish_Raw_Material,
          required: true,
          include: [
            {
              model: RawMaterial,
              required: true,
            },
          ],
          where: {
            status: "Active",
          },
        },
        {
          model: Product,
          required: true,
        },
      ],
    });

    if (data) {
      return res.json(data);
    } else {
      res.status(400);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred" });
  }
});

router.route("/fetchSpecificCookBook/:id").get(async (req, res) => {
  try {
    const data = await Cook_Book.findOne({
      include: [
        {
          model: Dish_Raw_Material,
          required: true,
          include: [
            {
              model: RawMaterial,
              required: true,
            },
          ],
          where: {
            status: "Active",
          },
        },
        {
          model: Product,
          required: true,
        },
      ],
      where: {
        cook_book_id: req.params.id,
      },
    });

    if (data) {
      return res.json(data);
    } else {
      res.status(400);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred" });
  }
});

router.put("/updateOperateStatus", async (req, res) => {
  try {
    const { cook_book_id, operate } = req.body;

    await Cook_Book.update({ operate: operate }, { where: { cook_book_id } });

    res.status(200).json({ message: "status updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update operate status" });
  }
});

router.route("/updateCookBook").put(async (req, res) => {
  try {
    const { updatedRawMaterials, idsToMarkInactive, userId } = req.body;

    const firstUpdate = updatedRawMaterials[0];
    const findProduct = await Cook_Book.findOne({
      where: {
        cook_book_id: firstUpdate.cook_book_id,
      },
      include: [
        {
          model: Product,
          required: true,
        },
      ],
    });
    const productName = findProduct.product.name;

    const existingRawMaterials = await Dish_Raw_Material.findAll({
      where: {
        cook_book_id: firstUpdate.cook_book_id,
      },
      include: [
        {
          model: RawMaterial,
          required: true,
        },
      ],
    });

    const previousIngredients = existingRawMaterials.map(
      (material) => material.raw_material.material_name
    );

    for (const updateRaw of updatedRawMaterials) {
      if (updateRaw.dish_raw_material_id) {
        await Dish_Raw_Material.update(
          {
            unit: updateRaw.unit,
            average_cost: updateRaw.average_cost,
            volume: updateRaw.volume,
            status: "Active",
          },
          {
            where: {
              dish_raw_material_id: updateRaw.dish_raw_material_id,
              cook_book_id: updateRaw.cook_book_id,
            },
          }
        );
      } else {
        const existingRawMaterial = await Dish_Raw_Material.findOne({
          where: {
            raw_material_id: updateRaw.raw_material_id,
            cook_book_id: updateRaw.cook_book_id,
            status: "Inactive",
          },
        });

        const existingRawMaterialActive = await Dish_Raw_Material.findOne({
          where: {
            raw_material_id: updateRaw.raw_material_id,
            cook_book_id: updateRaw.cook_book_id,
            status: "Active",
          },
        });

        if (existingRawMaterial) {
          // Update status to "Active"
          await Dish_Raw_Material.update(
            {
              unit: updateRaw.unit,
              average_cost: updateRaw.average_cost,
              volume: updateRaw.volume,
              status: "Active",
            },
            {
              where: {
                raw_material_id: updateRaw.raw_material_id,
                cook_book_id: updateRaw.cook_book_id,
                status: "Inactive",
              },
            }
          );
        } else if (existingRawMaterialActive) {
          const dishRaw = await Dish_Raw_Material.update(
            {
              unit: updateRaw.unit,
              average_cost: updateRaw.average_cost,
              volume: updateRaw.volume,
              status: "Active",
            },
            {
              where: {
                raw_material_id: updateRaw.raw_material_id,
                cook_book_id: updateRaw.cook_book_id,
                status: "Active",
              },
            }
          );

          if (dishRaw) {
            const fetchInv = await RawInventory.findAll({
              where: {
                raw_id: updateRaw.raw_material_id,
              },
            });

            const conversionRates = {
              L: 1,
              mL: 0.001,
              Kg: 1,
              g: 0.001,
              oz: 0.0295735,
              lbs: 0.453592,
              pcs: 1,
            };

            const gramRates = {
              g: 1,
              oz: 0.035274,
              lbs: 0.00220462,
            };

            const milimeterRates = {
              mL: 1,
              oz: 0.033814,
            };
            const literRates = {
              L: 1,
              mL: 0.001,
              oz: 0.033814,
            };
            const rawMatUnit = updateRaw.raw_material.unit_type;
            const selectedRawMatUnit = updateRaw.unit;

            let conversionRate;
            if (rawMatUnit == "g") {
              conversionRate = gramRates[selectedRawMatUnit];
            } else if (rawMatUnit == "ml") {
              conversionRate = milimeterRates[selectedRawMatUnit];
            } else if (rawMatUnit == "l") {
              conversionRate = literRates[selectedRawMatUnit];
            } else {
              conversionRate = conversionRates[selectedRawMatUnit];
            }

            const quantityTOdeduct = updateRaw.volume * conversionRate;

            for (const data of fetchInv) {
              await RawInventory.update(
                {
                  quantity: data.quantity - quantityTOdeduct,
                },
                {
                  where: {
                    raw_id: updateRaw.raw_material.raw_material_id,
                  },
                }
              );
            }
          }
        } else {
          const dishRaw = await Dish_Raw_Material.create({
            cook_book_id: updateRaw.cook_book_id,
            raw_material_id: updateRaw.raw_material_id,
            unit: updateRaw.unit,
            average_cost: updateRaw.average_cost,
            volume: updateRaw.volume,
            status: "Active",
          });

          if (dishRaw) {
            const fetchInv = await RawInventory.findAll({
              where: {
                raw_id: updateRaw.raw_material_id,
              },
            });

            const conversionRates = {
              L: 1,
              mL: 0.001,
              Kg: 1,
              g: 0.001,
              oz: 0.0295735,
              lbs: 0.453592,
              pcs: 1,
            };

            const gramRates = {
              g: 1,
              oz: 0.035274,
              lbs: 0.00220462,
            };

            const milimeterRates = {
              mL: 1,
              oz: 0.033814,
            };
            const literRates = {
              L: 1,
              mL: 0.001,
              oz: 0.033814,
            };
            const rawMatUnit = updateRaw.raw_material.unit_type;
            const selectedRawMatUnit = updateRaw.unit;

            let conversionRate;
            if (rawMatUnit == "g") {
              conversionRate = gramRates[selectedRawMatUnit];
            } else if (rawMatUnit == "ml") {
              conversionRate = milimeterRates[selectedRawMatUnit];
            } else if (rawMatUnit == "l") {
              conversionRate = literRates[selectedRawMatUnit];
            } else {
              conversionRate = conversionRates[selectedRawMatUnit];
            }

            const quantityTOdeduct = updateRaw.volume * conversionRate;

            for (const data of fetchInv) {
              await RawInventory.update(
                {
                  quantity: data.quantity - quantityTOdeduct,
                },
                {
                  where: {
                    raw_id: updateRaw.raw_material.raw_material_id,
                  },
                }
              );
            }
          }
        }
      }
    }

    if (idsToMarkInactive.length > 0) {
      await Dish_Raw_Material.update(
        { status: "Inactive" },
        { where: { raw_material_id: idsToMarkInactive } }
      );
    }

    const newRawMaterials = await Dish_Raw_Material.findAll({
      where: {
        cook_book_id: firstUpdate.cook_book_id,
        status: "Active",
      },
      include: [
        {
          model: RawMaterial,
          required: true,
        },
      ],
    });

    const newIngredients = newRawMaterials.map(
      (material) => material.raw_material.material_name
    );

    const actionMessage = `Cook Book: Update dish ${productName} from its previous ingredients ${previousIngredients.join(
      ", "
    )} into new ingredients ${newIngredients.join(", ")}`;
    await Activity_Log.create({
      masterlist_id: userId,
      action_taken: actionMessage,
    });

    res.status(200).send({ message: "success" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred" });
  }
});
module.exports = router;
