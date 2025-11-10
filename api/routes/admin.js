const express = require("express");
const router = express.Router();
const {
  adminLogin,
  getCurrentUser,
  refreshToken,
  logout,
  getDashboard,
} = require("../controllers/adminController");

router.post("/login", adminLogin);
router.get("/auth/me", getCurrentUser);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.get("/dashboard", getDashboard);

module.exports = router;

// const express = require("express");
// const router = express.Router();
// const { adminLogin, getDashboard ,logout, getCurrentUser} = require("../controllers/adminController");


// // Admin login route
// router.post("/login", adminLogin);
// router.get("/me", getCurrentUser);
// router.post("/logout", logout);

// module.exports = router;
