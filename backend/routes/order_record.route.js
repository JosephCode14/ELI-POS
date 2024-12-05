const router = require("express").Router();
const { where, Op } = require("sequelize");
const sequelize = require("../db/config/sequelize.config");
const {
  Cart_Specification_Variant,
  Specification_Variant,
  Cart,
  Order_Transaction,
  Product_Inventory,
  Product,
  Category,
  Category_Product,
  MasterList,
  Student,
  Student_Balance,
} = require("../db/models/associations");

//POS REPORTS MODULE
router.route("/fetchCheckoutTransaction").get(async (req, res) => {
  try {
    const data = await Order_Transaction.findAll({
      order: [["createdAt", "DESC"]],
    });
    if (data) {
      return res.json(data);
    } else {
      res.status(400).json("No data found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/fetchProductCheckout").get(async (req, res) => {
  try {
    const data = await Cart.findAll({
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
      where: {
        order_transaction_id: req.query.Idcheckout,
      },
    });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/fetchTocheckoutTransaction").get(async (req, res) => {
  try {
    const { transactionOrderId } = req.query;
    const cartItems = await Cart.findAll({
      where: {
        order_transaction_id: transactionOrderId,
      },
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
          // include: [
          //   {
          //     model: Category_Product,
          //     required: true,
          //     include: [
          //       {
          //         model: Category,
          //         required: true,
          //       },
          //       {
          //         model: Product,
          //         required: true,
          //       },
          //     ],
          //   },
          // ],
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
    });

    return res.json(cartItems);
  } catch (error) {
    console.error(error);
    return res.status(500).json("Error");
  }
});

//e-receipts data
router.route("/fetchOrderTransaction").get(async (req, res) => {
  try {
    const data = await Order_Transaction.findAll({
      order: [["createdAt", "DESC"]],
      where: {
        status: "Ordered",
      },
      include: [
        {
          model: MasterList,
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

//fetch ng mga product sa e-receipts
router.route("/fetchProduct-Ereceipt").get(async (req, res) => {
  try {
    const data = await Cart.findAll({
      include: [
        {
          model: Product_Inventory,
          required: true,
          include: [
            {
              model: Product,
              required: true,
            }
          ],
          // include: [
          //   {
          //     model: Category_Product,
          //     required: true,
          //     include: [
          //       {
          //         model: Product,
          //         required: true,
          //       },
          //     ],
          //   },
          // ],
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
      where: {
        order_transaction_id: req.query.Idcheckout,
      },
    });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/fetchStudent-Ereceipt").get(async (req, res) => {
  try {
    const { id } = req.query;
    const data = await Student_Balance.findOne({
      include: [
        {
          model: Student,
          required: true,
        },
      ],
      where: {
        student_id: id,
      },
    });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

module.exports = router;
