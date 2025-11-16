const bcrypt = require("bcrypt");
const { sequelize } = require("./db.js");
const { User } = require("./models/user.js");
require("dotenv").config();

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected...");
    await sequelize.sync({ alter: true });
    // Default admin credentials
    const account_number = "00000032";
    const password = "22413";
    const hashedPassword = await bcrypt.hash(password, 12);

    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { account_number, role: "admin" } });

    if (existingAdmin) {
      console.log("⚠️ Admin already exists:", existingAdmin.username);
    } else {
      await User.create({
        name: "System Administrator",
         email: "adminnew@mafaconnect.com", 
        account_number,
        password: hashedPassword,
        role: "admin",
        kyc_status: "approved",
        is_active: true,
        must_change_password: true, // force password change later
      });

      console.log("✅ Default admin created successfully!");
      console.log("➡️ Username:", account_number);
      console.log("➡️ Password:", password);
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating admin:", err);
    process.exit(1);
  }
})();
