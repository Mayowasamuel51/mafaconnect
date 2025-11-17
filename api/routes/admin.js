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
  getAllProducts,
} = require("../controllers/adminController");
const { authenticate, requireRole } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/multerUpload");

// working api for admin side
router.get('/allusers',authenticate, requireRole( "admin"), showAllUser)
router.get("/auth/me", authenticate, requireRole("customer", "sales_person", "manager", "admin"), getCurrentUser);
router.get('/users/{userId}/approval',authenticate, requireRole( "admin"), approveUser)
router.post('/users/:userId/roles',authenticate, requireRole( "admin"),assignRole)
// router.post(
//   "/products",
//   authenticate,
//   requireRole("admin", "manager"),   
//   upload.array("images"),        
//   createProduct
// );

router.post(
  "/products",
  authenticate,
  requireRole("admin", "manager"),
  upload.array("images"),
  createProduct
);

// Anyone logged-in can view products
router.get(
  "/products",
  getAllProducts
);

router.post("/login", adminLogin);

// router.get("/auth/me", authenticate, requireRole("user"), getCurrentUser);

router.post("/refresh", refreshToken);


router.post("/logout", logout);

// Only admins can access dashboard
router.get("/dashboard", authenticate, requireRole("admin"), getDashboard);
// router.get("/dashboard", getDashboard);

module.exports = router;
