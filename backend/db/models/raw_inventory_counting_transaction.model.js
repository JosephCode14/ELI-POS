const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Raw_Inventory_Counting_Transaction = sequelize.define(
  "raw_inventory_counting_transaction",
  {
    raw_inventory_counting_transaction_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    stock_counting_inventory_id: {
      type: DataTypes.INTEGER,
    },
    raw_inventory_counting_id: {
      type: DataTypes.INTEGER,
    },
  }
);

module.exports = Raw_Inventory_Counting_Transaction;
