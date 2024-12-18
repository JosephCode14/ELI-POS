const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Inventory_Outbound_Transaction = sequelize.define('inventory_outbound_transaction', {
    inventory_outbound_transaction_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    outbound_stock_inventory_id:{
        type: DataTypes.INTEGER,
    },
    product_inventory_outbound_id :{
        type: DataTypes.INTEGER,
    }
});

module.exports = Inventory_Outbound_Transaction;