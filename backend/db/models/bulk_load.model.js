// sequelize.config.js
const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Bulk_Load = sequelize.define("bulk_load", {
  bulk_load_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  transaction_number_id: {
    type: DataTypes.STRING,
  },
  masterlist_id: {
    type: DataTypes.INTEGER,
  },
  operation: {
    type: DataTypes.STRING,
  },
});

module.exports = Bulk_Load;
