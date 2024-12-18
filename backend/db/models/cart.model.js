// sequelize.config.js
const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Cart = sequelize.define("cart", {
  transaction_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  quantity: {
    type: DataTypes.DOUBLE,
    allowNull: true,
    unique: false,
  },
  purchased_amount: {
    type: DataTypes.DOUBLE,
    allowNull: true,
    unique: false,
  },
  subtotal: {
    type: DataTypes.DOUBLE,
    allowNull: true,
    unique: false,
  },
  product_inventory_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  order_transaction_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

module.exports = Cart;
