const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Product_Inventory = sequelize.define("product_inventory", {
  product_inventory_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  //   category_product_id: {
  //     type: DataTypes.INTEGER,
  //     allowNull: false,
  //   },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  //   price: {
  //     type: DataTypes.INTEGER,
  //     allowNull: true,
  //   },
});

module.exports = Product_Inventory;
