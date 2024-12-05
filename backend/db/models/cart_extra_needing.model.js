// sequelize.config.js
const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Cart_Extra_Needing = sequelize.define(
  "cart_extra_needing",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    cart_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    extra_variant_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    variant_price: {
      type: DataTypes.DOUBLE,
      allowNull: true
    }
  }
);

module.exports = Cart_Extra_Needing;
