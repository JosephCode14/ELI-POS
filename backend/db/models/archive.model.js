const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Archive = sequelize.define("archive", {
  archive_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  archive_time: {
    type: DataTypes.DATE,
  },
  remarks: {
    type: DataTypes.STRING,
  },
});

module.exports = Archive;
