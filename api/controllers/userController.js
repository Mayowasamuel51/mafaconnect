const bcrypt = require("bcrypt");
const { User } = require("../models/user");

// ✅ Customer/Business Registration
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, customer_type, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      customer_type,
      role: role || "user", // default
      kyc_status: "pending", // waiting for admin
      is_active: true,
    });

    res.status(201).json({
      message: "Account created successfully. Waiting for admin approval.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        kyc_status: user.kyc_status,
      },
    });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ message: "Server error during registration." });
  }
};



// const bcrypt = require("bcrypt");
// const { User } = require("../models/user");

// // ✅ User Registration
// exports.register = async (req, res) => {
//   try {
//     const { name, email, phone, password, customer_type } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({ message: "Name, email, and password are required." });
//     }

//     const existing = await User.findOne({ where: { email } });
//     if (existing) {
//       return res.status(400).json({ message: "Email already exists." });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = await User.create({
//       name,
//       email,
//       phone,
//       password: hashedPassword,
//       customer_type,
//       role: "customer", // ✅ All signups default to customer role
//     });

//     res.status(201).json({
//       message: "🎉 Account created successfully!",
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         customer_type: user.customer_type,
//       },
//     });
//   } catch (err) {
//     console.error("Signup error:", err.message);
//     res.status(500).json({ message: "Server error during registration." });
//   }
// };
