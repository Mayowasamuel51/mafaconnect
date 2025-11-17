const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models/user");
require("dotenv").config();
const cloudinary = require("../cloudinary");
const { Product, ProductImage } = require("../models");
/**
 * Helper to generate access token
 */
const generateAccessToken = (user) => {
  if (!process.env.JWT_ACCESS_SECRET) throw new Error("Missing JWT_ACCESS_SECRET");
  return jwt.sign(
    { id: user.id, role: user.role, account_number: user.account_number },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "9d" }
  );
};

const generateRefreshToken = (user) => {
  if (!process.env.JWT_REFRESH_SECRET) throw new Error("Missing JWT_REFRESH_SECRET");
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

exports.showAllUser = async (req, res) => {
  try {
    const users = await User.findAll();
    // console.log(users)
    return res.status(200).json({
      success: true,
      message: "All users fetched successfully",
      data: users
    });

  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message
    });
  }
};

// ✅ Admin approves user
exports.approveUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.kyc_status === "approved") {
      return res.status(400).json({ message: "User already approved" });
    }

    user.kyc_status = "approved";
    user.account_number = generateAccountNumber();
    await user.save();

    res.json({
      message: "✅ User approved successfully",
      account_number: user.account_number,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        kyc_status: user.kyc_status,
      },
    });
  } catch (err) {
    console.error("Approve error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.assignRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const validRoles = ["admin", "manager", "sales_agent", "customer"];

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update role
    user.role = role;
    await user.save();

    return res.json({
      success: true,
      message: "Role updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.error("Assign role error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error assigning role",
    });
  }
};


exports.createProduct = async (req, res) => {
  try {
    const userId = req.user.id;

  
    const product = await Product.create({
      name: req.body.name,
      sku: req.body.sku,
      description: req.body.description || null,
      cost_price: parseFloat(req.body.cost_price),
      sale_price: parseFloat(req.body.sale_price),
      stock_qty: parseInt(req.body.stock_qty),
      reorder_level: parseInt(req.body.reorder_level),
      active: true,
      created_by: userId,
    });

    // 2️⃣ Upload images to Cloudinary
    let uploadedImages = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await cloudinary.uploader.upload(file.path, {
          folder: "mafaconnect/products",
        });

        uploadedImages.push({
          product_id: product.id,
          image_url: uploadResult.secure_url,
          cloudinary_public_id: uploadResult.public_id,
        });
      }

      await ProductImage.bulkCreate(uploadedImages);
    }

    const productWithImages = await Product.findByPk(product.id, {
      include: [{ model: ProductImage, as: "images" }],
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: productWithImages,
    });

  } catch (err) {
    console.error("Create product error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        {
          model: ProductImage,
          as: "images",
          attributes: ["id", "image_url", "cloudinary_public_id"],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email", "role"], 
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
    });
    
  } catch (err) {
    console.error("❌ Fetch products error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error fetching products",
    });
  }
};


































exports.adminLogin = async (req, res) => {
  try {
    const { account_number, password } = req.body;

    // Find admin
    const admin = await User.findOne({ where: { account_number, role: "admin" } });
    if (!admin) return res.status(401).json({ message: "Invalid admin credentials" });
    if (!admin.is_active) return res.status(403).json({ message: "Admin account inactive" });

    // Verify password
    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return res.status(401).json({ message: "Incorrect password" });

    // Generate tokens
    const accessToken = generateAccessToken(admin);
    const refreshToken = generateRefreshToken(admin);

    // Store refresh token in secure cookie
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "✅ Admin login successful",
      accessToken,
      admin: {
        id: admin.id,
        name: admin.name,
        account_number: admin.account_number,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Server error during login" });
  }
};
exports.getCurrentUser = async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.findByPk(decoded.id, {
      attributes: ["id", "name", "account_number", "email", "role", "kyc_status", "is_active"],
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    console.error("Get user error:", err.message);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    res.status(401).json({ message: "Invalid or expired token" });
  }
}
exports.refreshToken = (req, res) => {
  try {
    const token = req.cookies.refresh_token;
    if (!token) return res.status(401).json({ message: "No refresh token provided" });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error("Refresh error:", err.message);
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
}
exports.logout = async (req, res) => {
  res.clearCookie("refresh_token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res.status(200).json({ message: "Logged out successfully" });
};

/**
 * ✅ Admin Dashboard (sample)
 */
exports.getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const pendingKyc = await User.count({ where: { kyc_status: "pending" } });
    const approvedKyc = await User.count({ where: { kyc_status: "approved" } });

    res.json({
      message: "Admin dashboard data",
      stats: { totalUsers, pendingKyc, approvedKyc },
    });
  } catch (err) {
    console.error("Dashboard error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};


// Generate a unique account number
function generateAccountNumber() {
  const random = Math.floor(10000000 + Math.random() * 90000000);
  return random.toString(); // e.g. "82643109"
}



























































// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const { User } = require("../models/user"); // your user model
// // Admin Login
// require("dotenv").config();

// exports.adminLogin = async (req, res) => {
//   try {
//     const { account_number, password } = req.body;

//     // Find admin by account number
//     const admin = await User.findOne({ where: { account_number, role: "admin" } });
//     if (!admin) return res.status(401).json({ message: "Invalid admin credentials" });

//     if (!admin.is_active) {
//       return res.status(403).json({ message: "Admin account inactive. Contact system owner." });
//     }

//     const valid = await bcrypt.compare(password, admin.password);
//     if (!valid) return res.status(401).json({ message: "Incorrect password" });

//     const token = jwt.sign(
//       { id: admin.id, role: admin.role, account_number: admin.account_number },
//       process.env.JWT_ACCESS_SECRET,
//       { expiresIn: "1h" }
//     );

//     res.json({
//       message: "✅ Admin login successful",
//       accessToken: token,
//       admin: {
//         id: admin.id,
//         name: admin.name,
//         account_number: admin.account_number,
//         role: admin.role,
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// exports.getCurrentUser = async (req, res) => {
//   try {
//     const authHeader = req.headers["authorization"];
//     if (!authHeader) return res.status(401).json({ message: "No token provided" });

//     const token = authHeader.split(" ")[1];
//     const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

//     const user = await User.findByPk(decoded.id, {
//       attributes: ["id", "name", "account_number", "email", "role", "kyc_status", "is_active"],
//     });

//     if (!user) return res.status(404).json({ message: "User not found" });

//     res.json({ user });
//   } catch (err) {
//     console.error(err);
//     res.status(401).json({ message: "Invalid or expired token" });
//   }
// };
// exports.logout = async (req, res) => {
//   try {
//     // Optional: verify token before logout
//     const authHeader = req.headers["authorization"];
//     if (!authHeader) return res.status(401).json({ message: "No token provided" });

//     const token = authHeader.split(" ")[1];
//     if (!token) return res.status(401).json({ message: "No token provided" });

//     // In production, you could blacklist this token
//     // For now, just respond OK
//     return res.status(200).json({ message: "Logged out successfully" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error during logout" });
//   }
// };

// // Admin Dashboard Data
// exports.getDashboard = async (req, res) => {
//   try {
//     const totalUsers = await User.count();
//     const pendingKyc = await User.count({ where: { kyc_status: "pending" } });
//     const approvedKyc = await User.count({ where: { kyc_status: "approved" } });

//     res.json({
//       message: "Admin dashboard data",
//       stats: {
//         totalUsers,
//         pendingKyc,
//         approvedKyc,
//       },
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
