const { Product } = require("./products");
const { ProductImage } = require("./productimages");
const { User } = require("./user");

// Product → Images
Product.hasMany(ProductImage, { foreignKey: "product_id", as: "images" });
ProductImage.belongsTo(Product, { foreignKey: "product_id" });

// Product → Creator
Product.belongsTo(User, { foreignKey: "created_by", as: "creator" });

module.exports = {
  Product,
  ProductImage,
  User,
};
