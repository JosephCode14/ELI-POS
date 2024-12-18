const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Raw_Inventory_Counting = sequelize.define("raw_inventory_counting", {
  raw_inventory_counting_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  raw_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  system_count: {
    type: DataTypes.DOUBLE,
    allowNull: false,
  },
  actual_count: {
    type: DataTypes.DOUBLE,
    allowNull: false,
  },
  stock_loss: {
    type: DataTypes.DOUBLE,
    allowNull: false,
  },
});

module.exports = Raw_Inventory_Counting;
