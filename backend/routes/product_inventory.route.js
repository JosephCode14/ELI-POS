const router = require("express").Router();
const { where, Op } = require("sequelize");
const sequelize = require("../db/config/sequelize.config");
const {
  Product_Inventory,
  Product,
  Category,
  Category_Product,
} = require("../db/models/associations");

//fetch Inventory Stock
router.route("/getInventoryStock").get(async (req, res) => {
  try {
    const data = await Product_Inventory.findAll({
      include: [
        {
          model: Product,
          required: true,
          where: {
            is_archived: { [Op.ne]: 1 },
          },
        },
      ],
      // include: [{
      //     model: Category_Product,
      //     required: true,
      //         include:[{
      //             model: Category,
      //             required: true,
      //         },{
      //             model: Product,
      //             required: true,
      //             where: {
      //                 is_archived: { [Op.ne]: 1 }
      //             }
      //         }],
      //         where: {
      //         status: 'Active'
      //         },
      //     }],
    });

    return res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/getProductInventory").get(async (req, res) => {
  try {
    const data = await Product_Inventory.findAll({
      include: [
        {
          model: Category_Product,
          required: true,
          include: [
            {
              model: Category,
              required: true,
            },
            {
              model: Product,
              required: true,
            },
          ],
          where: {
            status: "Active",
          },
        },
      ],
    });
    return res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});
module.exports = router;
