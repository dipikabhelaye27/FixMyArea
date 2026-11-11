const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Determine writable directory for uploads.
// On Vercel Serverless / AWS Lambda, the deployment directory (/var/task) is strictly read-only (EROFS).
// os.tmpdir() (/tmp) is the sanctioned writable temporary directory.
let uploadDir;
try {
  const localDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true });
  }
  // Verify write permission; will throw EROFS in read-only container
  fs.accessSync(localDir, fs.constants.W_OK);
  uploadDir = localDir;
} catch (e) {
  uploadDir = path.join(os.tmpdir(), 'fixmyarea_uploads');
  if (!fs.existsSync(uploadDir)) {
    try {
      fs.mkdirSync(uploadDir, { recursive: true });
    } catch (mkdirErr) {
      uploadDir = os.tmpdir();
    }
  }
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'pw1sfe2t',
  api_key: process.env.CLOUDINARY_API_KEY || '844318645731772',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'z2uUe56vHU7Ap0XDiN422nI3VGY'
});

// Configure Multer storage to safely use the writable uploadDir
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
 * Uploads a file to Cloudinary with automatic fallback to local serving
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
    console.warn('⚠️ Cloudinary upload warning (using fallback):', cloudErr.message);
    const fileName = path.basename(filePath);
    return `/uploads/${fileName}`;
  }
};

module.exports = {
  upload,
  uploadToCloudinaryOrLocal,
  cloudinary,
  uploadDir
};

