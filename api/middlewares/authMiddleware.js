const jwt = require("jsonwebtoken");
const { User } = require("../models/user");
require("dotenv").config();

/**
 * ✅ Verify JWT token and attach user to request
 */
exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token missing" });

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.findByPk(decoded.id, {
      attributes: ["id", "name", "account_number", "role", "is_active"],
    });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.is_active) return res.status(403).json({ message: "User inactive" });

    req.user = user; // attach to request
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

/**
 * ✅ Role-based authorization middleware
 * Example: requireRole("admin")
 */
exports.requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }

    next();
  };
};
