const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Student = sequelize.define("student", {
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  first_name: {
    type: DataTypes.STRING,
  },
  middle_name: {
    type: DataTypes.STRING,
  },
  last_name: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
  },
  contact_number: {
    type: DataTypes.STRING,
  },
  address: {
    type: DataTypes.STRING,
  },
  rfid: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.STRING,
  },
  validity: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  student_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  student_pin: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  credit_enable: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
});

module.exports = Student;
