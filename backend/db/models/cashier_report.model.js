const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const CashierReport = sequelize.define("cashier_report", {
  cashier_report_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  start_shift: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  end_shift: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  total_checkout: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  total_income: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  total_item_sold: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  total_refund: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  total_cash: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  total_card: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  total_load: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  remarks: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  employee_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  shift_duration: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cash_drawer: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  difference: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  remittance: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  starting_money: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
});

module.exports = CashierReport;
