// Assuming you're using Express.js for your backend
const express = require("express");
const router = express.Router();
const {
  Product,
  Category,
  Category_Product,
  Product_Inventory,
  Specification_Main,
  Specification_Variant,
  Category_Product_Specification,
} = require("../db/models/associations");
const { where, Op } = require("sequelize");

router.post("/category_product/create", async (req, res) => {
  try {
    const { product_id, category_id } = req.body;

    // Check if the association already exists
    const existingAssociation = await Category_Product.findOne({
      where: {
        product_id: product_id,
        category_id: category_id,
      },
    });

    if (existingAssociation) {
      // If the association already exists, send a message indicating that
      res.status(202).json({ message: "Association already exists" });
    } else {
      await Category_Product.create({
        product_id: product_id,
        category_id: category_id,
      });

      res.status(200).json({ message: "Association created successfully" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while creating the association" });
  }
});

//fetching para sa menu ng ordering kapag nagclick ng category
router.route("/fetchSpecificCategory").get(async (req, res) => {
  try {
    const data = await Category_Product.findAll({
      include: [
        {
          model: Category,
          required: true,
        },
        {
          model: Product,
          required: true,
          where: {
            is_archived: false,
          },
        },
      ],
      where: {
        category_id: req.query.Idcategory,
        status: "Active",
      },
    });
    return res.json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred" });
  }
});

//fetch for inventory category dropdown, mag-add ng quantity
router.route("/fetchInventoryCategory").get(async (req, res) => {
  try {
    const data = await Category_Product.findAll({
      include: [
        {
          model: Product,
          required: true,
          include: [
            {
              model: Product_Inventory,
              required: false,
            },
          ],
          where: {
            is_archived: 0,
          },
        },

        {
          model: Category,
          required: true,
        },
      ],
      where: {
        category_id: req.query.Idcategory,
        status: "Active",
      },
    });
    return res.json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred" });
  }
});

//fetch for outbound quantity magbawas
router.route("/fetchInventoryOutbound").get(async (req, res) => {
  try {
    const data = await Category_Product.findAll({
      include: [
        {
          model: Product,
          required: true,
          include: [
            {
              model: Product_Inventory,
              required: true,
              where: {
                quantity: {
                  [Op.ne]: 0,
                },
              },
            },
          ],
          where: {
            is_archived: 0,
          },
        },

        {
          model: Category,
          required: true,
        },
      ],
      where: {
        category_id: req.query.Idcategory,
        status: "Active",
      },
    });
    return res.json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred" });
  }
});

//fetch for inventory stock counting category dropdown
router.route("/fetchCategoryStockCounting").get(async (req, res) => {
  try {
    const data = await Category_Product.findAll({
      include: [
        {
          model: Product,
          required: true,
          include: [
            {
              model: Product_Inventory,
              required: false,
            },
          ],
          where: {
            is_archived: 0,
          },
        },

        {
          model: Category,
          required: true,
        },
      ],
      where: {
        category_id: req.query.Idcategory,
        status: "Active",
      },
    });

    return res.json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred" });
  }
});

module.exports = router;
