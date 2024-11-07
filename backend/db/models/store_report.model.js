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
    type: DataTypes.DATEONLY,
  },
  store_close: {
    type: DataTypes.DATEONLY,
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
});

module.exports = Store_Report;
