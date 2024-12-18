const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Student_Balance = sequelize.define("student_balance", {
  student_balance_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  balance: {
    type: DataTypes.DOUBLE,
    allowNull: false,
  },
});

module.exports = Student_Balance;
