const router = require("express").Router();
const { where, Op } = require("sequelize");
const sequelize = require("../db/config/sequelize.config");
const { MasterList, Activity_Log } = require("../db/models/associations");
const moment = require("moment");

router.route("/getActivityLog").get(async (req, res) => {
  try {
    const todayDate = moment().startOf("day").format("YYYY-MM-DD");
    const tomorrowDate = moment()
      .add(1, "days")
      .startOf("day")
      .format("YYYY-MM-DD");

    const activityLogs = await MasterList.findAll({
      where: {
        user_type: { [Op.notIn]: ["Superadmin", "Kiosk"] },
      },
      include: [
        {
          model: Activity_Log,
          required: true,
          where: {
            createdAt: {
              [Op.gte]: todayDate,
              [Op.lt]: tomorrowDate,
            },
          },
        },
      ],
    });

    // const userIdtype = Notsuperadmin.map((item) => item.col_id);

    // const actlog = await MasterList.findAll({
    // include: [
    //   {
    //     model: MasterList,
    //     required: true,
    //   },
    // ],
    // attributes: [
    //   "masterlist_id",
    //   [
    //     sequelize.fn("MAX", sequelize.col("Activity_Log.createdAt")),
    //     "maxCreatedAt",
    //   ],
    // ],
    // where: {
    //   masterlist_id: userIdtype,
    // },
    // group: ["masterlist_id"],
    // order: [["maxCreatedAt", "DESC"]],
    // });

    res.status(200).json(activityLogs);
  } catch (err) {
    console.error(err);
    res.status(500).json("Error");
  }
});

router.route("/fetchDropdownActivityLog").get(async (req, res) => {
  try {
    console.log("MASTERLIST ID", req.query.id);
    const data = await Activity_Log.findAll({
      where: {
        masterlist_id: req.query.id,
      },
      order: [["createdAt", "DESC"]],
    });
    return res.json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred" });
  }
});

module.exports = router;
