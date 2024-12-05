const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Load_Transaction = sequelize.define("load_transaction", {
  load_transaction_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  student_balance_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  load_amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  deduct_amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  old_balance: {
    type: DataTypes.FLOAT,
  },
  new_balance: {
    type: DataTypes.FLOAT,
  },
  masterlist_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Load_Transaction;
