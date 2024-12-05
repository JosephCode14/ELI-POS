const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Specification_Variant = sequelize.define("specification_variant", {
  specification_variant_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  specification_main_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  variant_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  variant_price: {
    type: DataTypes.DOUBLE,
    allowNull: true,
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
});

module.exports = Specification_Variant;
