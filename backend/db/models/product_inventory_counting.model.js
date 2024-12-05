const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Product_Inventory_Counting = sequelize.define(
  "product_inventory_counting",
  {
    product_inventory_counting_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    product_inventory_id: {
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
  }
);

module.exports = Product_Inventory_Counting;
