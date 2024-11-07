const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Credit_Student_Meal = sequelize.define("credit_student_meal", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  static_breakfast: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  static_lunch: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  static_dinner: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  breakfast: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  lunch: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  dinner: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  date_valid: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  use_credit: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date_approved: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  requestor: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  approver: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  credit_price: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
});

module.exports = Credit_Student_Meal;
