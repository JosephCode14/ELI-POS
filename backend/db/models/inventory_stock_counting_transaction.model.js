const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Inventory_Stock_Counting_Transaction = sequelize.define(
  "inventory_stock_counting_transaction",
  {
    inventory_stock_counting_transaction_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    stock_counting_inventory_id: {
      type: DataTypes.INTEGER,
    },
    product_inventory_counting_id: {
      type: DataTypes.INTEGER,
    },
  }
);

module.exports = Inventory_Stock_Counting_Transaction;
