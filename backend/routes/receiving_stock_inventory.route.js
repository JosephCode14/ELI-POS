const router = require("express").Router();
const { where, Op, literal } = require("sequelize");
const sequelize = require("../db/config/sequelize.config");
const { Receiving_Stock_Inventory } = require("../db/models/associations");

// Fetch
router.route("/getReceivingStockInventory").get(async (req, res) => {
  try {
    const data = await Receiving_Stock_Inventory.findAll({
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

router.route("/getSearchResults/:search").get(async (req, res) => {
  try {
    const { search } = req.params;

    const data = await Receiving_Stock_Inventory.findAll({
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
