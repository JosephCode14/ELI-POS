const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Specification_Main = sequelize.define("specification_main", {
  specification_main_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  specification_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  specification_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Specification_Main;
