const router = require("express").Router();
const { where, Op, fn, col, literal } = require("sequelize");
const sequelize = require("../db/config/sequelize.config");
const cron = require("node-cron");
const {
  Student,
  Credit_Student_Meal,
  Activity_Log,
  Store_Profile,
} = require("../db/models/associations");
const moment = require("moment");

//create a requests credits for students galing sa requestor
router.route("/createRequests").post(async (req, res) => {
  try {
    const { userId, requests } = req.body;

    let totalCredits = 0;
    let studentCount = requests.length;
    let dateRange = { start: null, end: null };

    for (const [index, request] of requests.entries()) {
      await Credit_Student_Meal.create({
        student_id: request.student_id,
        static_breakfast: request.breakfast,
        static_lunch: request.lunch,
        static_dinner: request.dinner,
        breakfast: request.breakfast,
        lunch: request.lunch,
        dinner: request.dinner,
        date_valid: request.date,
        use_credit: request.total_credit,
        status: "For Approval",
        requestor: userId,
        approver: null,
      });

      totalCredits += request.total_credit;

      if (index === 0) {
        dateRange.start = request.date;
      }
      dateRange.end = request.date;
    }

    await Activity_Log.create({
      masterlist_id: userId,
      action_taken: `Requested credits for ${studentCount} students, total credits: ${totalCredits}, date range: ${dateRange.start} to ${dateRange.end}`,
    });

    return res.status(200).json({ message: "Requests created successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json("Error");
  }
});

//create a credits for students galing sa approver
router.route("/createCreditsApprover").post(async (req, res) => {
  try {
    const { userId, credits } = req.body;
    console.log("CREDITS DATA", credits);

    const creditPrice = await Store_Profile.findOne();

    let totalCredits = 0;
    let studentCount = credits.length;
    let dateRange = { start: null, end: null };

    for (const [index, credit] of credits.entries()) {
      let existingRecord = await Credit_Student_Meal.findOne({
        where: {
          student_id: credit.student_id,
          date_valid: credit.date,
        },
      });

      if (existingRecord) {
        await existingRecord.update({
          static_breakfast: credit.breakfast,
          static_lunch: credit.lunch,
          static_dinner: credit.dinner,
          breakfast: credit.breakfast,
          lunch: credit.lunch,
          dinner: credit.dinner,
          use_credit: credit.total_credit,
          status: "Approved",
          requestor: userId,
          approver: userId,
          date_approved: new Date().toISOString().split("T")[0],
          credit_price: creditPrice.store_student_meal_price,
        });
      } else {
        await Credit_Student_Meal.create({
          student_id: credit.student_id,
          static_breakfast: credit.breakfast,
          static_lunch: credit.lunch,
          static_dinner: credit.dinner,
          breakfast: credit.breakfast,
          lunch: credit.lunch,
          dinner: credit.dinner,
          date_valid: credit.date,
          use_credit: credit.total_credit,
          status: "Approved",
          requestor: userId,
          approver: userId,
          date_approved: new Date().toISOString().split("T")[0],
          credit_price: creditPrice.store_student_meal_price,
        });
      }

      totalCredits += credit.total_credit;

      if (index === 0) {
        dateRange.start = credit.date;
      }
      dateRange.end = credit.date;
    }

    // Log the activity
    await Activity_Log.create({
      masterlist_id: userId,
      action_taken: `Approver create credits for ${studentCount} students, total credits: ${totalCredits}, date range: ${dateRange.start} to ${dateRange.end}`,
    });

    return res.status(200).json({ message: "Requests processed successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json("Error");
  }
});

//approve for requests credits for students galing kay approver
router.route("/approveRequests").put(async (req, res) => {
  try {
    const { userId, credits } = req.body;
    // Validate the incoming data
    if (!userId || !credits || !Array.isArray(credits)) {
      return res.status(201).json({ message: "Invalid request data" });
    }

    const creditPrice = await Store_Profile.findOne();

    // Process each credit request
    const updatePromises = credits.map(async (credit) => {
      return Credit_Student_Meal.update(
        {
          static_breakfast: credit.breakfast,
          static_lunch: credit.lunch,
          static_dinner: credit.dinner,
          breakfast: credit.breakfast,
          lunch: credit.lunch,
          dinner: credit.dinner,
          use_credit: credit.total_credit, // Include use_credit in the update
          status: "Approved",
          approver: userId,
          date_approved: new Date().toISOString().split("T")[0],
          credit_price: creditPrice.store_student_meal_price,
        },
        {
          where: {
            id: credit.id,
            date_valid: credit.date_valid,
          },
        }
      );
    });

    await Promise.all(updatePromises);

    // Send success response
    res.status(200).json({ message: "Requests approved successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json("Error");
  }
});

//fetching ng request galing sa requestor
router.route("/getRequestsforCredits").get(async (req, res) => {
  try {
    // Kukunin ang 7 magkakaibang date mula sa 'date_valid' field
    const distinctDates = await Credit_Student_Meal.findAll({
      attributes: ["date_valid"],
      where: {
        status: "For Approval",
      },
      order: [["date_valid", "ASC"]],
      group: ["date_valid"], // I-group ang bawat unique date
      limit: 7, // Limitahan sa unang 7 date valid
    });

    if (!distinctDates || distinctDates.length < 7) {
      return res.status(204).send(); // No content found
    }

    // kuhain ang min ng date valid bilang 'start' at ang pang-pitong petsa bilang 'end'
    const start = distinctDates[0].date_valid;
    const end = distinctDates[6].date_valid;

    const data = await Credit_Student_Meal.findAll({
      include: [
        {
          model: Student,
          required: true,
        },
      ],
      where: {
        date_valid: {
          [Op.between]: [start, end],
        },
        status: "For Approval",
      },
      order: [["date_valid", "ASC"]],
    });

    if (data && data.length > 0) {
      return res.json(data);
    } else {
      return res.status(204).send(); // No content found
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json("Error");
  }
});

//get student for modal request credits
router.route("/getStudentWithCredit").get(async (req, res) => {
  try {
    const data = await Student.findAll({
      where: {
        credit_enable: {
          [Op.ne]: false,
        },
        status: {
          [Op.ne]: "Inactive",
        },
      },
    });

    if (data && data.length > 0) {
      return res.json(data);
    } else {
      return res.status(204).send();
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json("Error");
  }
});

//route of date kada week
router.route("/getPerWeekDate").get(async (req, res) => {
  try {
    // Get the max date from the `date_valid` column
    const maxDateResult = await Credit_Student_Meal.max("date_valid");

    // Determine the start of the next week (Monday)
    let startOfNextWeek;

    if (maxDateResult) {
      // If there's a max date, calculate the Monday of the next week based on the max date
      startOfNextWeek = moment(maxDateResult)
        .add(1, "weeks")
        .startOf("isoWeek");
    } else {
      // If no data, calculate the Monday of the next week based on the current date
      startOfNextWeek = moment().add(1, "weeks").startOf("isoWeek");
    }

    const nextWeekDates = [];
    for (let i = 0; i < 7; i++) {
      nextWeekDates.push(
        startOfNextWeek.clone().add(i, "days").format("YYYY-MM-DD")
      );
    }

    return res.json(nextWeekDates);
  } catch (err) {
    console.error(err);
    return res.status(500).json("Error");
  }
});

//for table of current weekly credit
router.route("/getStudentCurrentWeekCreditsMeal").get(async (req, res) => {
  try {
    const startOfWeek = moment().startOf("isoWeek").format("YYYY-MM-DD");
    const endOfWeek = moment().endOf("isoWeek").format("YYYY-MM-DD");

    const data = await Student.findAll({
      where: {
        credit_enable: {
          [Op.ne]: false,
        },
        status: {
          [Op.ne]: "Inactive",
        },
      },
      include: [
        {
          model: Credit_Student_Meal,
          where: {
            date_valid: {
              [Op.between]: [startOfWeek, endOfWeek],
            },
          },
          required: false,
        },
      ],
      order: [[Credit_Student_Meal, "date_valid", "ASC"]],
    });

    if (data && data.length > 0) {
      const result = data.map((student) => {
        const credits = {
          Monday: 0,
          Tuesday: 0,
          Wednesday: 0,
          Thursday: 0,
          Friday: 0,
          Saturday: 0,
          Sunday: 0,
        };

        student.credit_student_meals.forEach((meal) => {
          const dayOfWeek = moment(meal.date_valid).format("dddd");
          credits[dayOfWeek] = meal.use_credit;
        });

        return {
          student: {
            id: student.student_id,
            first_name: student.first_name,
            last_name: student.last_name,
            student_number: student.student_number,
          },
          credits,
          status:
            student.credit_student_meals.length > 0
              ? student.credit_student_meals[0].status
              : "N/A",
        };
      });

      return res.status(200).json({ result, startOfWeek, endOfWeek });
    } else {
      return res.status(202).json({ startOfWeek, endOfWeek });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json("Error");
  }
});

router.route("/getStudentPreviousWeekCreditsMeal").get(async (req, res) => {
  try {
    const startOfPreviousWeek = moment()
      .subtract(1, "weeks")
      .startOf("isoWeek")
      .format("YYYY-MM-DD");

    const endOfPreviousWeek = moment()
      .subtract(1, "weeks")
      .endOf("isoWeek")
      .format("YYYY-MM-DD");
    const data = await Student.findAll({
      where: {
        credit_enable: {
          [Op.ne]: false,
        },
        status: {
          [Op.ne]: "Inactive",
        },
      },
      include: [
        {
          model: Credit_Student_Meal,
          where: {
            date_valid: {
              [Op.between]: [startOfPreviousWeek, endOfPreviousWeek],
            },
          },
          required: false,
        },
      ],
      order: [[Credit_Student_Meal, "date_valid", "ASC"]],
    });

    console.log(startOfPreviousWeek, endOfPreviousWeek);

    if (data && data.length > 0) {
      const result = data.map((student) => {
        const credits = {
          Monday: 0,
          Tuesday: 0,
          Wednesday: 0,
          Thursday: 0,
          Friday: 0,
          Saturday: 0,
          Sunday: 0,
        };

        student.credit_student_meals.forEach((meal) => {
          const dayOfWeek = moment(meal.date_valid).format("dddd");
          credits[dayOfWeek] = meal.use_credit;
        });

        return {
          student: {
            id: student.student_id,
            first_name: student.first_name,
            last_name: student.last_name,
            student_number: student.student_number,
          },
          credits,
          status:
            student.credit_student_meals.length > 0
              ? student.credit_student_meals[0].status
              : "N/A",
        };
      });

      return res.json({ result, startOfPreviousWeek, endOfPreviousWeek });
    } else {
      return res.status(202).json({ startOfPreviousWeek, endOfPreviousWeek });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json("Error");
  }
});

router.route("/getCreditToday").get(async (req, res) => {
  try {
    const today = moment().format("YYYY-MM-DD");

    const data = await Credit_Student_Meal.findAll({
      include: [
        {
          model: Student,
          required: true,
          where: {
            credit_enable: {
              [Op.ne]: false,
            },
            status: {
              [Op.ne]: "Inactive",
            },
          },
        },
      ],
      where: {
        date_valid: today,
      },
      order: [["date_valid", "ASC"]],
    });
    console.log(data);

    if (data) {
      return res.json(data);
    } else {
      res.status(400);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json("Error");
  }
});

// Schedule the cron job to run at 11:55 PM every day
cron.schedule("55 23 * * *", async () => {
  try {
    const today = moment().format("YYYY-MM-DD");

    // Update breakfast, lunch, and dinner to false where date_valid is today
    const resetCredits = await Credit_Student_Meal.update(
      {
        breakfast: false,
        lunch: false,
        dinner: false,
      },
      {
        where: {
          date_valid: today,
        },
      }
    );

    if (resetCredits[0] > 0) {
      console.log("Credits for today have been reset.");
    } else {
      console.log("No credits found to reset for today.");
    }
  } catch (error) {
    console.error("An error occurred while updating credits:", error);
  }
});
module.exports = router;
