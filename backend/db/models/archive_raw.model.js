const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Archive_Raw = sequelize.define("archive_raw", {
  archive_raw_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  archive_raw_time: {
    type: DataTypes.DATE,
  },
  remarks: {
    type: DataTypes.STRING,
  },
  raw_material_id: {
    type: DataTypes.INTEGER,
  },
});

module.exports = Archive_Raw;
