const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");

const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  account_number: { type: DataTypes.STRING, allowNull: true, unique: true },
  phone: { type: DataTypes.STRING, allowNull: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: {
    type: DataTypes.ENUM("admin", "manager", "sales_agent", "customer"),
    defaultValue: "customer",
  },
  kyc_status: {
    type: DataTypes.ENUM("pending", "approved", "rejected"),
    defaultValue: "pending",
  },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: "users",
  timestamps: true,
});

module.exports = { User };

// const { DataTypes } = require("sequelize");
// const { sequelize } = require("../db");

// const User = sequelize.define("User", {
//   id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

//   name: { type: DataTypes.STRING, allowNull: false },
//   email: { type: DataTypes.STRING, allowNull: false, unique: true },
//   phone: { type: DataTypes.STRING, allowNull: true },
//   password: { type: DataTypes.STRING, allowNull: false },

//   // generated after admin approval
//   account_number: { type: DataTypes.STRING, allowNull: true, unique: true },

//   customer_type: {
//     type: DataTypes.ENUM("individual", "business"),
//     defaultValue: "individual",
//   },

//   role: {
//     type: DataTypes.ENUM("admin", "manager", "sales_person", "customer"),
//     defaultValue: "customer",
//   },

//   kyc_status: {
//     type: DataTypes.ENUM("pending", "approved", "rejected"),
//     defaultValue: "pending",
//   },

//   is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
// }, {
//   tableName: "users",
//   timestamps: true,
// });

// module.exports = { User };
// const { DataTypes } = require("sequelize");
// const { sequelize } = require("../db");

// const User = sequelize.define("User", {
//   id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

//   name: { type: DataTypes.STRING, allowNull: false },
//   email: { type: DataTypes.STRING, allowNull: false, unique: true },
//   phone: { type: DataTypes.STRING, allowNull: true },

//   password: { type: DataTypes.STRING, allowNull: false },

//   customer_type: {
//     type: DataTypes.ENUM("individual", "business"),
//     defaultValue: "individual",
//   },

//   role: {
//     type: DataTypes.ENUM("admin", "manager", "sales_person", "customer"),
//     defaultValue: "customer",
//   },

//   kyc_status: {
//     type: DataTypes.ENUM("pending", "approved", "rejected"),
//     defaultValue: "pending",
//   },

//   is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
// }, {
//   tableName: "users",
//   timestamps: true,
// });

// module.exports = { User };

// // const { DataTypes } = require("sequelize");
// // const { sequelize } = require("../db");

// // const User = sequelize.define(
// //   "User",
// //   {
// //     id: {
// //       type: DataTypes.INTEGER,
// //       autoIncrement: true,
// //       primaryKey: true,
// //     },
// //     name: {
// //       type: DataTypes.STRING,
// //       allowNull: true,
// //     },
// //     username: {
// //       type: DataTypes.STRING,
// //       allowNull: true,
// //       unique: true,
// //     },
// //     account_number: {
// //       type: DataTypes.STRING,
// //       allowNull: true,
// //       unique: true,
// //     },
    
// //     email: {
// //       type: DataTypes.STRING,
// //       allowNull: true,
// //       unique: true,
// //     },
// //     password: {
// //       type: DataTypes.STRING,
// //       allowNull: false,
// //     },
// //     role: {
// //       type: DataTypes.ENUM("admin", "manager", "sales_person", "customer"),
// //       defaultValue: "customer",
// //     },
// //     kyc_status: {
// //       type: DataTypes.ENUM("pending", "approved", "rejected"),
// //       defaultValue: "pending",
// //     },
// //     kyc_submitted: {
// //       type: DataTypes.BOOLEAN,
// //       defaultValue: false,
// //     },
// //     is_active: {
// //       type: DataTypes.BOOLEAN,
// //       defaultValue: false,
// //     },
// //     must_change_password: {
// //       type: DataTypes.BOOLEAN,
// //       defaultValue: false,
// //     },
// //   },
// //   {
// //     tableName: "users",
// //     timestamps: true,
// //   }
// // );

// // module.exports = { User };
