const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Store_Status = sequelize.define("store_status", {
  store_status_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  status: {
    type: DataTypes.BOOLEAN,
  },
});

module.exports = Store_Status;
