const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const UserLogin = sequelize.define("user_login", {
  login_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  masterlist_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  starting_money: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
});

module.exports = UserLogin;
