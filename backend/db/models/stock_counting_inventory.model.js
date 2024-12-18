const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Stock_Counting_Inventory = sequelize.define("stock_counting_inventory", {
  stock_counting_inventory_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  remarks: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  transaction_number_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Stock_Counting_Inventory;
