const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Cook_Book = sequelize.define("cook_book", {
  cook_book_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  cook_book_number_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
  },
  operate: {
    type: DataTypes.BOOLEAN,
  },
});

module.exports = Cook_Book;
