const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  host: "180.232.37.178",
  database: "eli_pos",
  dialect: "mysql",
  username: "root",
  password: "LGVsgb68148",
  timezone: "+08:00",
  alter: false,
});

sequelize
  .sync()
  .then(() => {
    console.log("Database synced successfully");
  })
  .catch((e) => {
    console.error("Database synchronization failed: " + e);
  });

module.exports = sequelize;
