const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Raw_Inventory_Outbound = sequelize.define("raw_inventory_outbound", {
  raw_inventory_outbound_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  raw_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  old_quantity: {
    type: DataTypes.DOUBLE,
    allowNull: false,
  },
  new_quantity: {
    type: DataTypes.DOUBLE,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  outbound_quantity: {
    type : DataTypes.DOUBLE,
  },
});

module.exports = Raw_Inventory_Outbound;
