const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Dish_Raw_Material = sequelize.define("dish_raw_material", {
  dish_raw_material_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  cook_book_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  raw_material_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  unit: {
    type: DataTypes.STRING,
  },
  average_cost: {
    type: DataTypes.FLOAT,
  },
  volume: {
    type: DataTypes.FLOAT,
  },
  status: {
    type: DataTypes.STRING,
  },
});

module.exports = Dish_Raw_Material;
