const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Receiving_Stock_Inventory = sequelize.define(
  "receiving_stock_inventory",
  {
    receiving_stock_inventory_id: {
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
  }
);

module.exports = Receiving_Stock_Inventory;
