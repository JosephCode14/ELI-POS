const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Extra_Main = sequelize.define("extra_main", {
  extra_main_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  extra_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  extra_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Extra_Main;
