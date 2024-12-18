const express = require("express");
const { Customize_Receipt } = require("../db/models/associations");
const router = express.Router();

const { where, Op } = require("sequelize");

router.route("/fetchSettings").get(async (req, res) => {
  try {
    const data = await Customize_Receipt.findAll({});

    if (data) {
      return res.json(data);
    } else {
      res.json({});
    }
  } catch (error) {
    res.status(500).json("Error");
  }
});

router.route("/customize").put(async (req, res) => {
  try {
    const { receiptData } = req.body;

    const data = await Customize_Receipt.findOne();

    if (data) {
      for (const receipt of receiptData) {
        await Customize_Receipt.update(
          {
            splitAbove: receipt.splitAbove,
            splitBelow: receipt.splitBelow,
            blankAbove: receipt.blankAbove,
            blankBelow: receipt.blankBelow,
            size: receipt.size,
            weight: receipt.weight,
            alignment: receipt.alignment,
          },
          {
            where: {
              name: receipt.name,
            },
          }
        );
      }
    } else {
      for (const receipt of receiptData) {
        await Customize_Receipt.create({
          name: receipt.name,
          splitAbove: receipt.splitAbove,
          splitBelow: receipt.splitBelow,
          blankAbove: receipt.blankAbove,
          blankBelow: receipt.blankBelow,
          size: receipt.size,
          weight: receipt.weight,
          alignment: receipt.alignment,
        });
      }
    }

    res.status(200).send({ message: "Success" });
  } catch (error) {
    console.error(error);
    res.status(500).json("Error");
  }
});

module.exports = router;
