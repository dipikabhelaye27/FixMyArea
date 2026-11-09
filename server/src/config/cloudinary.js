const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure local uploads directory exists for fallback
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'pw1sfe2t',
  api_key: process.env.CLOUDINARY_API_KEY || '844318645731772',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'WlsbZkX_vQ1G5207-Yg46yJkPz4'
});

// Configure Multer storage to disk first so we have the file buffer/path
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'fixmyarea-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

/**
 * Uploads a file to Cloudinary with automatic fallback to local disk serving
 * @param {string} filePath - Absolute path to uploaded local file
 * @returns {Promise<string>} - Public accessible image URL
 */
const uploadToCloudinaryOrLocal = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'fixmyarea_reports',
      resource_type: 'image'
    });
    console.log('✅ Uploaded to Cloudinary successfully:', result.secure_url);
    // Remove local temp file after successful upload to cloud
    try { fs.unlinkSync(filePath); } catch (e) {}
    return result.secure_url;
  } catch (cloudErr) {
    console.warn('⚠️ Cloudinary upload failed (using high-speed local fallback):', cloudErr.message);
    const fileName = path.basename(filePath);
    return `/uploads/${fileName}`;
  }
};

module.exports = {
  upload,
  uploadToCloudinaryOrLocal,
  cloudinary
};

