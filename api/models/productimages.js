const { DataTypes } = require("sequelize");
const { sequelize } = require("../db");

const ProductImage = sequelize.define(
  "ProductImage",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    image_url: { type: DataTypes.STRING, allowNull: false },
    cloudinary_public_id: { type: DataTypes.STRING, allowNull: false },
  },
  {
    tableName: "product_images",
    timestamps: true,
  }
);

module.exports = { ProductImage };
