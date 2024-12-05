const router = require("express").Router();
const { where, Op } = require("sequelize");
const sequelize = require("../db/config/sequelize.config");
const {
  Specification_Main,
  Specification_Variant,
} = require("../db/models/associations");

router.route("/fetchSpecificSpecification").get(async (req, res) => {
  try {
    const data = await Specification_Main.findAll({
      include: [
        {
          model: Specification_Variant,
          required: true,
        },
      ],
      where: {
        specification_main_id: req.query.specMainIds,
      },
    });
    return res.json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred" });
  }
});

module.exports = router;
