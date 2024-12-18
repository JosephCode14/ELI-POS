// sequelize.config.js
const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Cart_Specification_Variant = sequelize.define(
  "cart_specification_variant",
  {
    cart_specification_variant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    cart_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    specification_variant_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    variant_price: {
      type: DataTypes.DOUBLE,
      allowNull: true
    }
  }
);

module.exports = Cart_Specification_Variant;
