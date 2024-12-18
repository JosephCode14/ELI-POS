const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Customize_Receipt = sequelize.define("customize_receipt", {
  customize_receipt_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  splitAbove: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  splitBelow: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  blankAbove: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  blankBelow: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  size: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  weight: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  alignment: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Customize_Receipt;
