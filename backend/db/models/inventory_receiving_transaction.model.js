const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Inventory_Receiving_Transaction = sequelize.define(
  "inventory_receiving_transaction",
  {
    inventory_receiving_transaction_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    receiving_stock_inventory_id: {
      type: DataTypes.INTEGER,
    },
    product_inventory_accumulate_id: {
      type: DataTypes.INTEGER,
    },
  }
);

module.exports = Inventory_Receiving_Transaction;
