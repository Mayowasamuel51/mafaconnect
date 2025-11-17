const express = require("express");
const router = express.Router();
const {
  adminLogin,
  getCurrentUser,
  refreshToken,
  logout,
  getDashboard, showAllUser,
  assignRole,
  approveUser,
  createProduct,
} = require("../controllers/adminController");
const { authenticate, requireRole } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/multerUpload");

// working api for admin side
router.get('/allusers',authenticate, requireRole( "admin"), showAllUser)
router.get("/auth/me", authenticate, requireRole("customer", "sales_person", "manager", "admin"), getCurrentUser);
router.get('/users/{userId}/approval',authenticate, requireRole( "admin"), approveUser)
router.post('/users/:userId/roles',authenticate, requireRole( "admin"),assignRole)
router.post(
  "/products",
  authenticate,
  requireRole("admin", "manager"),   // 🟢 Only these roles can upload products
  upload.array("images", 10),        // 🟢 Accept up to 10 images
  createProduct
);

router.post("/login", adminLogin);

// router.get("/auth/me", authenticate, requireRole("user"), getCurrentUser);

router.post("/refresh", refreshToken);


router.post("/logout", logout);

// Only admins can access dashboard
router.get("/dashboard", authenticate, requireRole("admin"), getDashboard);
// router.get("/dashboard", getDashboard);

module.exports = router;
