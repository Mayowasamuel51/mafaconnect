
const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");

const Product = sequelize.define(
  "Product",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    sku: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: { type: DataTypes.TEXT },
    cost_price: { type: DataTypes.FLOAT, allowNull: false },
    sale_price: { type: DataTypes.FLOAT, allowNull: false },
    stock_qty: { type: DataTypes.INTEGER, defaultValue: 0 },
    reorder_level: { type: DataTypes.INTEGER, defaultValue: 50 },
    active: { type: DataTypes.BOOLEAN, defaultValue: true },
    created_by: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: "products",
    timestamps: true,
  }
);

module.exports = { Product };

// // models/Product.js
// const { DataTypes } = require("sequelize");
// const { sequelize } = require("../db");
// const { User } = require("./user.js");
// const { ProductImage } = require("./productimages");
// const Product = sequelize.define(
//   "Product",
//   {
//     id: {
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       primaryKey: true,
//     },

//     name: { type: DataTypes.STRING, allowNull: false },

//     sku: { type: DataTypes.STRING, allowNull: false, unique: true },

//     description: { type: DataTypes.TEXT, allowNull: true },

//     cost_price: { type: DataTypes.FLOAT, allowNull: false },

//     sale_price: { type: DataTypes.FLOAT, allowNull: false },

//     stock_qty: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },

//     reorder_level: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 50 },

//     active: { type: DataTypes.BOOLEAN, defaultValue: true },

//     // NEW → Store the admin/manager who created the product
//     created_by: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//   },
//   {
//     tableName: "products",
//     timestamps: true,
//   }
// );

// // RELATION
// Product.belongsTo(User, { foreignKey: "created_by", as: "creator" });


// Product.hasMany(ProductImage, { foreignKey: "product_id", as: "images" });
// ProductImage.belongsTo(Product, { foreignKey: "product_id" });

// module.exports = { Product };
