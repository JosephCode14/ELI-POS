// sequelize.config.js
const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Void_Transaction = sequelize.define("void_transaction", {
  void_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  order_transaction_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  masterlist_id:{
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  supervisor_id:{
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

module.exports = Void_Transaction;
