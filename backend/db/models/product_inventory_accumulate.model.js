const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Product_Inventory_Accumulate = sequelize.define(
  "product_inventory_accumulate",
  {
    product_inventory_accumulate_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    product_inventory_id: {
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
    stocked_price: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    total_price: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    quantity_received: {
      type: DataTypes.DOUBLE,
    },
  }
);

module.exports = Product_Inventory_Accumulate;
