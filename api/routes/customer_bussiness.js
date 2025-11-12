

const express = require("express");
const router = express.Router();
const {
  adminLogin,
  getCurrentUser,
  refreshToken,
  logout,
  getDashboard,
} = require("../controllers/adminController");
const { register } = require("../controllers/userController");
const { login } = require("../controllers/authController");


router.post("/register", register);

router.post("/login/user", login);

module.exports = router;


