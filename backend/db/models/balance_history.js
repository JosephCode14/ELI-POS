// sequelize.config.js
const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Balance_History = sequelize.define("balance_history", {
  balance_history_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  order_transaction_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  student_id: {
    type: DataTypes.DOUBLE,
    allowNull: true,
    unique: false,
  },
  old_balance: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  new_balance: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Balance_History;
