const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Category_Product_Specification = sequelize.define(
  "category_product_specification",
  {
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
    specification_main_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }
);

module.exports = Category_Product_Specification;
