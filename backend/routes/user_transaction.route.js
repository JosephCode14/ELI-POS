const router = require("express").Router();
const { where, Op } = require("sequelize");
const {
  Student_Balance,
  Student,
  Order_Transaction,
  Cart,
  Load_Transaction,
  Balance_History,
  Product_Inventory,
  Category_Product,
  Product,
  Cart_Specification_Variant,
  Specification_Variant,
} = require("../db/models/associations");
const sequelize = require("../db/config/sequelize.config");

router.get("/getStudent", async (req, res) => {
  try {
    const customerData = await Student_Balance.findAll({
      include: [
        {
          model: Student,
          include: [
            {
              model: Order_Transaction,
              where: {
                status: "Ordered",
              },
              required: false,
            },
          ],
        },
      ],
    });
    if (customerData) {
      return res.json(customerData);
    } else {
      res.status(400);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json("Error");
  }
});

router.get("/getSpecificStudent/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const customerData = await Student_Balance.findAll({
      include: [
        {
          model: Student,
          include: [
            {
              model: Order_Transaction,
              include: [
                {
                  model: Cart,
                  include: [
                    {
                      model: Product_Inventory,
                      include: [
                        {
                          model: Product,
                          required: true,
                        },
                      ],
                    },
                    {
                      model: Cart_Specification_Variant,
                      required: false,
                      include: [
                        {
                          model: Specification_Variant,
                          required: true,
                        },
                      ],
                    },
                  ],
                },
                {
                  model: Balance_History,
                  required: false,
                },
              ],
              required: false,
              where: {
                status: "Ordered",
              },
            },
          ],
        },
        {
          model: Load_Transaction,
        },
      ],
      where: {
        student_id: id,
      },
    });
    if (customerData) {
      return res.json(customerData);
    } else {
      res.status(400);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json("Error");
  }
});

router.get("/getSearchUser", async (req, res) => {
  const { search } = req.query;
  try {
    const data = await Student_Balance.findAll({
      include: [
        {
          model: Student,
          where: {
            [Op.or]: [
              { first_name: { [Op.like]: `%${search}%` } },
              { last_name: { [Op.like]: `%${search}%` } },
              { rfid: { [Op.like]: `%${search}%` } },
              { middle_name: { [Op.like]: `%${search}%` } },
              {
                [Op.and]: search.split(" ").map((namePart) => ({
                  [Op.or]: [
                    { first_name: { [Op.like]: `%${namePart}%` } },
                    { middle_name: { [Op.like]: `%${namePart}%` } },
                    { last_name: { [Op.like]: `%${namePart}%` } },
                  ],
                })),
              },
            ],
          },
          include: [
            {
              model: Order_Transaction,
              where: {
                status: "Ordered",
              },
              required: false,
            },
          ],
        },
      ],
    });

    console.log(data);
    if (data) {
      return res.json(data);
    } else {
      res.status(400);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json("Error");
  }
});

router.route("/filterStudent/:filter").get(async (req, res) => {
  try {
    const { filter } = req.params;

    const data = await Student_Balance.findAll({
      include: [
        {
          model: Student,
          where: {
            status: filter,
          },
          include: [
            {
              model: Order_Transaction,
              where: {
                status: "Ordered",
              },
              required: false,
            },
          ],
        },
      ],
    });

    console.log(data);

    if (data.length > 0) {
      return res.json(data);
    } else {
      return res.status(400);
    }
  } catch (err) {
    console.error(err);
    return res.status(500);
  }
});

module.exports = router;
