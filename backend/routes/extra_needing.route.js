const router = require("express").Router();
const { where, Op } = require("sequelize");
const sequelize = require("../db/config/sequelize.config");
const {
  Extra_Main,
  Extra_Variant,
  RawMaterial,
  RawInventory,
} = require("../db/models/associations");

router.route("/fetchExtraNeeding").get(async (req, res) => {
  try {
    const data = await Extra_Main.findAll({
      include: [
        {
          model: Extra_Variant,
          required: true,
          include: [
            {
              model: RawMaterial,
              required: true,
              include: [
                {
                  model: RawInventory,
                  required: true,
                  where: {
                    quantity: {
                      [Op.ne]: 0,
                    },
                  },
                },
              ],
            },
          ],
          where: {
            status: {
              [Op.ne]: 0,
            },
          },
        },
      ],
      where: {
        extra_main_id: req.query.extraMainIds,
      },
    });
    return res.json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred" });
  }
});

module.exports = router;
