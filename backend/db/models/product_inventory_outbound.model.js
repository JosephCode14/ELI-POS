const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Product_Inventory_Outbound = sequelize.define(
  "product_inventory_outbound",
  {
    product_inventory_outbound_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    product_inventory_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    old_quantity: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    new_quantity: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    outbound_quantity: {
      type: DataTypes.DOUBLE,
    }
  }
);

module.exports = Product_Inventory_Outbound;
