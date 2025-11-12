const express = require("express");
const app = express();
const dotenv = require("dotenv");
// const cookieParser = require("cookie-parser");
const cors = require("cors");
const { sequelize } = require("./db.js");
const adminRoutes = require("./routes/admin");
const customer_bussiness=  require("./routes/customer_bussiness.js");
dotenv.config();


app.use(express.json());
// app.use(cookieParser());

// ✅ Allow both localhost variants
app.use(
  cors({
    origin: ["http://localhost:8081", "http://127.0.0.1:8081", "http://localhost:8080", "http://127.0.0.1:8080", ,"https://www.to-analytics.com"],
    credentials: true,
  })
);

// ✅ API routes
app.use("/api/v1", adminRoutes);
app.use("/api/v1", customer_bussiness);

app.get("/", (req, res) => res.send("🚀 MafaConnect Backend is running..."));

const PORT = process.env.PORT || 8000;

(async () => {
  try {
    await sequelize.authenticate();
    // await sequelize.sync();
    await sequelize.sync({ alter: true });
    console.log("✅ Connected to MySQL");

    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error("❌ Failed to start server:", err);
  }
})();

// const express = require("express");
// const dotenv = require("dotenv");
// const cookieParser = require("cookie-parser");
// const cors = require("cors");
// const { sequelize } = require("./db.js"); // adjust path if db.js is inside config/
// // const authRoutes = require("./routes/auth");
// // const kycRoutes = require("./routes/kyc");
// const adminRoutes = require("./routes/admin");
// dotenv.config();
// const app = express();
// // app.use(cors({ origin: "*", credentials: false }));
// app.use(cors({
//   origin: "http://localhost:8081",
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   credentials: true
// }));
// const PORT = process.env.PORT || 8000;

// // ✅ Middleware
// app.use(express.json());
// app.use(cookieParser());

// // ✅ Base routes
// // app.use("/api/auth", authRoutes);
// // app.use("/api/kyc", kycRoutes);
// app.use("/api/admin", adminRoutes);

// // ✅ Health check
// app.get("/", (req, res) => {
//   res.send("🚀 MafaConnect Backend API is running...");
// });

// // ✅ DB connection + start server
// (async () => {
//   try {
//     await sequelize.authenticate();
//     // await sequelize.sync({ alter: true });
//     await sequelize.sync(); // or { force: fal
//     console.log("✅ Connected to MySQL database");

//     app.listen(PORT, () => {
//       console.log(`🚀 Server running on port ${PORT}`);
//     });
//   } catch (err) {
//     console.error("❌ Failed to start server:", err);
//   }
// })();

