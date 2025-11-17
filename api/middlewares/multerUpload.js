const multer = require("multer");
const path = require("path");

// Temporary storage before Cloudinary upload
const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

function fileFilter(req, file, cb) {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only images are allowed"), false);
}

const upload = multer({ storage, fileFilter });

module.exports = upload;
