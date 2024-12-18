const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Outbound_Stock_Inventory = sequelize.define("outbound_stock_inventory", {
  outbound_stock_inventory_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  remarks: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  transaction_number_id: {
    type: DataTypes.STRING,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Outbound_Stock_Inventory;
