const express = require("express");
const router = express.Router();
const {
  adminLogin,
  getCurrentUser,
  refreshToken,
  logout,
  getDashboard,
} = require("../controllers/adminController");
const { authenticate, requireRole } = require("../middlewares/authMiddleware");

router.post("/login", adminLogin);
<<<<<<< HEAD
router.get("/auth/me", authenticate, requireRole("customer", "sales_person", "manager", "admin"), getCurrentUser);
=======
router.get("/auth/me", authenticate, requireRole("user", "sales_person", "manager", "admin"), getCurrentUser);
>>>>>>> 4646d22c81cd92c48b61aac62080ffd4d6e0dc09
// router.get("/auth/me", authenticate, requireRole("user"), getCurrentUser);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
// Only admins can access dashboard
router.get("/dashboard", authenticate, requireRole("admin"), getDashboard);
// router.get("/dashboard", getDashboard);

module.exports = router;
