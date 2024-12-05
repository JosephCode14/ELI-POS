// sequelize.config.js
const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Order_Transaction = sequelize.define("order_transaction", {
  order_transaction_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  payable_amount: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  received_amount: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  change_amount: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  payment_method: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  purchased_balance: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  order_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  order_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  masterlist_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  date_checkout: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  remarks: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Order_Transaction;
