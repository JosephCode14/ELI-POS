const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Extra_Variant = sequelize.define("extra_variant", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  extra_main_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  raw_material_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  unit_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  volume: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  price: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
});

module.exports = Extra_Variant;
