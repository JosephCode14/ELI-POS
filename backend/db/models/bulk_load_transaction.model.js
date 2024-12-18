// sequelize.config.js
const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Bulk_Load_Transaction = sequelize.define("bulk_load_transaction", {
  bulk_load_transaction_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  bulk_load_id: {
    type: DataTypes.INTEGER,
  },
  load_transaction_id: {
    type: DataTypes.INTEGER,
  },
});

module.exports = Bulk_Load_Transaction;
