const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Raw_Inventory_Accumulate = sequelize.define("raw_inventory_accumulate", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  raw_inventory_id: {
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
  total_price: {
    type: DataTypes.DOUBLE,
    allowNull: false,
  },
  quantity_received: {
    type: DataTypes.DOUBLE,
  }
});

module.exports = Raw_Inventory_Accumulate;
