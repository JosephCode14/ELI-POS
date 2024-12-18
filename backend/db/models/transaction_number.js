const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Transaction_Number = sequelize.define(
  "transaction_number",
  {
    transaction_number_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    transaction_counter: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "001",
    },
    transaction_lastDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = Transaction_Number;
