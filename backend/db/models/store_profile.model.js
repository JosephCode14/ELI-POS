const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Student = sequelize.define("store_profile", {
  store_profile_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  store_code: {
    type: DataTypes.STRING,
  },
  store_name: {
    type: DataTypes.STRING,
  },
  store_country: {
    type: DataTypes.STRING,
  },
  store_ip: {
    type: DataTypes.STRING,
  },
  store_student_meal_price: {
    type: DataTypes.DOUBLE,
  },
  idle_time: {
    type: DataTypes.INTEGER
  },
  image: {
    type: DataTypes.BLOB("long"),
    allowNull: true,
    get() {
      const value = this.getDataValue("image");
      return value ? value.toString("base64") : null;
    },
    set(value) {
      if (value) {
        this.setDataValue("image", Buffer.from(value, "base64"));
      } else {
        this.setDataValue("image", null);
      }
    },
  },
});

module.exports = Student;
