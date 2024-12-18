const sequelize = require("../config/sequelize.config");
const { DataTypes } = require("sequelize");

const Kiosk_Img = sequelize.define("kiosk_img", {
  kiosk_img_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  // kiosk_img: {
  //   type: DataTypes.BLOB("long"),
  //   allowNull: true,
  //   get() {
  //     const value = this.getDataValue("kiosk_img");
  //     return value ? value.toString("base64") : null;
  //   },
  //   set(value) {
  //     this.setDataValue("kiosk_img", Buffer.from(value, "base64"));
  //   },
  // },
  kiosk_img: {
    type: DataTypes.BLOB("long"),
    allowNull: true,
    get() {
      const value = this.getDataValue("kiosk_img");
      return value ? value.toString("base64") : null;
    },
    set(value) {
      if (typeof value === "string") {
        this.setDataValue("kiosk_img", Buffer.from(value, "base64"));
      } else if (Buffer.isBuffer(value)) {
        this.setDataValue("kiosk_img", value);
      } else {
        throw new TypeError("Expected a base64-encoded string or a Buffer.");
      }
    },
  },
  img_screen_loc: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  uploaded_by: {
    type: DataTypes.STRING,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = Kiosk_Img;
