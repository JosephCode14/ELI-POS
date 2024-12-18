const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Order_Counter = sequelize.define(
  "order_counter",
  {
    counter_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    counter: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "001",
    },
    lastDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = Order_Counter;
