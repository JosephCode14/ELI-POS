const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Raw_Inventory_Receiving_Transaction = sequelize.define(
  "raw_inventory_receiving_transaction",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    receiving_stock_inventory_id: {
      type: DataTypes.INTEGER,
    },
    raw_inventory_accumulate_id: {
      type: DataTypes.INTEGER,
    },
  }
);

module.exports = Raw_Inventory_Receiving_Transaction;
