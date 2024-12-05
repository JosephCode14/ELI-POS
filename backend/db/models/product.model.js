const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Product = sequelize.define("product", {
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  price: {
    type: DataTypes.DOUBLE,
  },
  // unit: {
  //   type: DataTypes.STRING,
  //   allowNull: true,
  // },
  is_archived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  sku: {
    type: DataTypes.STRING,
  },
  threshold: {
    type: DataTypes.BIGINT,
  },
  image: {
    type: DataTypes.BLOB("long"),
    allowNull: true,
    get() {
      const value = this.getDataValue("image");
      return value ? value.toString("base64") : null;
    },
    set(value) {
      this.setDataValue("image", Buffer.from(value, "base64"));
    },
  },
  printable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = Product;
