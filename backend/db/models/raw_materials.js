const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const RawMaterial = sequelize.define("raw_materials", {
  raw_material_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  material_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  unit_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  unit_price: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  threshold: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  is_archived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = RawMaterial;
