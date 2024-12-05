const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Student_Meal_Time = sequelize.define("student_meal_time", {
  student_meal_time_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  time_from: {
    type: DataTypes.TIME,
  },
  time_to: {
    type: DataTypes.TIME,
  },
  category_id: {
    type: DataTypes.INTEGER,
  },
});

module.exports = Student_Meal_Time;
