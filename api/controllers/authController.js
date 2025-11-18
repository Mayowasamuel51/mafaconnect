const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models/user");
require("dotenv").config();

/**
 * Generate JWT Access Token
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      account_number: user.account_number,
      email: user.email,
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "9d" }
  );
};



exports.login = async (req, res) => {
  try {
    let { identifier, account_number, email, password } = req.body;
    identifier = identifier || account_number || email;

    if (!identifier || !password) {
      console.error(" identifier undefined — request body:", req.body);
      return res
        .status(400)
        .json({ message: "Email, account number, or identifier is required." });
    }

    console.log(" Login attempt for:", identifier);

    // Find user by account_number OR email
    const user = await User.findOne({
      where: {
        [Op.or]: [{ account_number: identifier }, { email: identifier }],
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid password." });

    // Generate token
    const token = generateAccessToken(user);

    // Return login message based on approval
    const message =
      user.kyc_status === "approved"
        ? " Login successful"
        : "Login successful, but your account is pending admin approval. Some features will be limited.";

    res.status(200).json({
      message,
      accessToken: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        account_number: user.account_number,
        role: user.role,
        kyc_status: user.kyc_status,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
};





/**
 * 🟢 Universal Login Controller
 * Works for admin, manager, sales_person, and customer
 */
// exports.login = async (req, res) => {
//   try {
//     // Accepts multiple keys from frontend / Postman
//     let { identifier, account_number, email, password } = req.body;

//     // Auto-pick whichever was sent
//     identifier = identifier || account_number || email;

//     // Validate input
//     if (!identifier || !password) {
//       console.error("🚨 identifier undefined — request body:", req.body);
//       return res
//         .status(400)
//         .json({ message: "Email, account number, or identifier is required." });
//     }

//     console.log("🧩 Login attempt for:", identifier);

//     // Find user by account_number OR email
//     const user = await User.findOne({
//       where: {
//         [Op.or]: [{ account_number: identifier }, { email: identifier }],
//       },
//     });

//     if (!user) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     // Check if approved by admin
//     if (user.kyc_status !== "approved") {
//       return res.status(403).json({
//         message: "Your account has not been approved by an admin yet.",
//       });
//     }

//     // Verify password
//     const valid = await bcrypt.compare(password, user.password);
//     if (!valid) return res.status(401).json({ message: "Invalid password." });

//     // Generate token
//     const token = generateAccessToken(user);

//     // Send response
//     res.status(200).json({
//       message: "✅ Login successful",
//       accessToken: token,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         account_number: user.account_number,
//         role: user.role,
//         kyc_status: user.kyc_status,
//       },
//     });
//   } catch (err) {
//     console.error("❌ Login error:", err);
//     res.status(500).json({ message: "Server error during login." });
//   }
// };
// const { Op } = require("sequelize");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const { User } = require("../models/user");
// require("dotenv").config();
// exports.login = async (req, res) => {
//   try {
//     let { identifier, password } = req.body;
//     console.log(req.body)
//     if (!identifier || !password) {
//       return res.status(400).json({ message: "Email or account number and password are required." });
//     }

//     console.log("🧩 Identifier:", identifier);

//     // Search by account_number first, fallback to email
//     let user = await User.findOne({ where: { account_number: identifier } });
//     if (!user) user = await User.findOne({ where: { email: identifier } });

//     if (!user) return res.status(404).json({ message: "User not found" });

//     if (user.kyc_status !== "approved")
//       return res.status(403).json({ message: "Account not yet approved by admin" });

//     const valid = await bcrypt.compare(password, user.password);
//     if (!valid) return res.status(401).json({ message: "Invalid password" });

//     const token = jwt.sign(
//       { id: user.id, role: user.role, account_number: user.account_number },
//       process.env.JWT_ACCESS_SECRET,
//       { expiresIn: "1h" }
//     );

//     res.json({
//       message: "✅ Login successful",
//       accessToken: token,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         account_number: user.account_number,
//       },
//     });
//   } catch (err) {
//     console.error("Login error:", err);
//     res.status(500).json({ message: "Server error during login." });
//   }
// };

// // exports.login = async (req, res) => {
// //     try {
// //         let { identifier, password } = req.body;

// //         //Accept email or account_number keys
// //         if (!identifier && req.body.email) identifier = req.body.email;
// //         if (!identifier && req.body.account_number) identifier = req.body.account_number;
// //         console.log("🧩 Identifier value:", identifier, password);
// //         if (!identifier || !password) {
// //             return res.status(400).json({ message: "Email or account number and password are required." });
// //         }

// //         console.log("🧩 Identifier received:", identifier);

// //         // 🔍 Find user by either email or account_number
// //         const user = await User.findOne({
// //             where: {
// //                 [Op.or]: [
// //                     { email: identifier },
// //                     { account_number: identifier }
// //                 ],
// //             },
// //         });

// //         if (!user) {
// //             return res.status(404).json({ message: "User not found." });
// //         }

// //         if (user.kyc_status !== "approved") {
// //             return res.status(403).json({ message: "Account not yet approved by admin." });
// //         }

// //         const valid = await bcrypt.compare(password, user.password);
// //         if (!valid) return res.status(401).json({ message: "Invalid password." });

// //         const token = jwt.sign(
// //             { id: user.id, role: user.role, account_number: user.account_number },
// //             process.env.JWT_ACCESS_SECRET,
// //             { expiresIn: "1h" }
// //         );

// //         res.json({
// //             message: "Login successful",
// //             accessToken: token,
// //             user: {
// //                 id: user.id,
// //                 name: user.name,
// //                 email: user.email,
// //                 role: user.role,
// //                 account_number: user.account_number,
// //             },
// //         });
// //     } catch (err) {
// //         console.error("Login error:", err.message
// //         );
// //         res.status(500).json({ message: "Server error during login." });
// //     }
// // };


// // const bcrypt = require("bcrypt");
// // const jwt = require("jsonwebtoken");
// // const { User, sequelize } = require("../models/user");
// // const { Op } = require("sequelize");
// // require("dotenv").config();

// // exports.login = async (req, res) => {
// //   try {
// //     let { identifier, password } = req.body;

// //     // 🧩 Support legacy keys (email/account_number)
// //     if (!identifier && req.body.email) identifier = req.body.email;
// //     if (!identifier && req.body.account_number) identifier = req.body.account_number;

// //     if (!identifier || !password) {
// //       return res.status(400).json({ message: "Email or account number and password are required." });
// //     }

// //     // 🔍 Find user by email OR account_number
// //     const user = await User.findOne({
// //       where: {
// //         [Op.or]: [{ email: identifier }, { account_number: identifier }],
// //       },
// //     });

// //     if (!user) {
// //       return res.status(404).json({ message: "User not found." });
// //     }

// //     if (user.kyc_status !== "approved") {
// //       return res.status(403).json({ message: "Account not yet approved by admin." });
// //     }

// //     const valid = await bcrypt.compare(password, user.password);
// //     if (!valid) return res.status(401).json({ message: "Invalid password." });

// //     const token = jwt.sign(
// //       { id: user.id, role: user.role, account_number: user.account_number },
// //       process.env.JWT_ACCESS_SECRET,
// //       { expiresIn: "1h" }
// //     );

// //     res.json({
// //       message: "✅ Login successful",
// //       accessToken: token,
// //       user: {
// //         id: user.id,
// //         name: user.name,
// //         email: user.email,
// //         role: user.role,
// //         account_number: user.account_number,
// //       },
// //     });
// //   } catch (err) {
// //     console.error("Login error:", err.message);
// //     res.status(500).json({ message: "Server error during login." });
// //   }
// // };
