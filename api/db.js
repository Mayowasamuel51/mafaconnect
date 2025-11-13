
const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'mysql',       // keep 'mysql' here
  dialectModule: require('mysql2'), // <- explicitly tell Sequelize to use mysql2
  logging: false,
  dialectOptions: {
    ssl: { rejectUnauthorized: false } // if needed for remote DB like Render
  },
  logging: false
});

sequelize.authenticate()
  .then(() => console.log('Database connected!'))
  .catch(err => console.error('Unable to connect:', err));

// const sequelize = new Sequelize(
//   process.env.DB_NAME,
//   process.env.DB_USER,
//   process.env.DB_PASS,
//   {
//     host: process.env.DB_HOST || "localhost",
//     dialect: "mysql",
//     logging: false,
//   }
// );

module.exports = { sequelize };
