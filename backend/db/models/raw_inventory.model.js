const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Raw_Inventory = sequelize.define("raw_inventory", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  raw_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.DOUBLE,
    allowNull: false,
  },
});

module.exports = Raw_Inventory;
