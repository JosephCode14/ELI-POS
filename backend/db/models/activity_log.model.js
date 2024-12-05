const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Activity_Log = sequelize.define("activity_log", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },

  masterlist_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  action_taken: {
    type: DataTypes.STRING(5000),
    allowNull: true,
  },
});

module.exports = Activity_Log;
