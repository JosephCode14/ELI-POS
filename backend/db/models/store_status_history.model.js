const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Store_Status_History = sequelize.define("store_status_history", {
  store_status_history_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  store_status_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  masterlist_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  reference: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.BOOLEAN,
  },
});

module.exports = Store_Status_History;
