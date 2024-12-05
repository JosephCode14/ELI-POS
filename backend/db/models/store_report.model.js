const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Store_Report = sequelize.define("store_report", {
  store_report_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  store_open: {
    type: DataTypes.DATE,
  },
  store_close: {
    type: DataTypes.DATE,
  },
  total_sales: {
    type: DataTypes.DOUBLE,
  },
  total_purchased: {
    type: DataTypes.DOUBLE,
  },
  total_sold: {
    type: DataTypes.DOUBLE,
  },
  total_refund: {
    type: DataTypes.DOUBLE,
  },
  total_cash: {
    type: DataTypes.DOUBLE,
  },
  total_card: {
    type: DataTypes.DOUBLE,
  },
  total_difference: {
    type: DataTypes.DOUBLE,
  },
  total_remittance: {
    type: DataTypes.DOUBLE,
  },
  total_load: {
    type: DataTypes.DOUBLE,
  },
});
module.exports = Store_Report;
