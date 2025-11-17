const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;


VITE_CLOUDINARY_IMAGE_URL = "https://api.cloudinary.com/v1_1/dicz9c7kk/image/upload"

VITE_CLOUDINARY_VIDEO_URL = "https://api.cloudinary.com/v1_1/dicz9c7kk/video/upload"

VITE_CLOUDINARY_ADS_UPLOAD_PRESET = "mypromosphere"

VITE_CLOUDINARY_CLOUD_NAME = "dicz9c7kk"
