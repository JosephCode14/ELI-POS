const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Raw_Inventory_Outbound_Transaction = sequelize.define(
  "raw_inventory_outbound_transaction",
  {
    raw_inventory_outbound_transaction_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    outbound_stock_inventory_id: {
      type: DataTypes.INTEGER,
    },
    raw_inventory_outbound_id: {
      type: DataTypes.INTEGER,
    },
  }
);

module.exports = Raw_Inventory_Outbound_Transaction;
