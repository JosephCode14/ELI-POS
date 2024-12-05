const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Category_Product_Extra = sequelize.define("category_product_extra", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  extra_main_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Category_Product_Extra;
