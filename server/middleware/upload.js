const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Disk storage for local fallback / temporary buffer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only valid image files (JPG, PNG, WEBP, GIF) are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
});

// Middleware to upload to Cloudinary if available, otherwise keep local static path
const processImageUpload = async (req, res, next) => {
  try {
    if (!req.file && (!req.files || req.files.length === 0)) {
      return next();
    }

    if (isCloudinaryConfigured) {
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'civicfix/issues',
        });
        // Clean up temp file
        fs.unlink(req.file.path, () => {});
        req.file.url = result.secure_url;
      }

      if (req.files && Array.isArray(req.files)) {
        for (const file of req.files) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'civicfix/issues',
          });
          fs.unlink(file.path, () => {});
          file.url = result.secure_url;
        }
      }
    } else {
      // Local fallback - create static relative URL
      if (req.file) {
        req.file.url = `/uploads/${req.file.filename}`;
      }
      if (req.files && Array.isArray(req.files)) {
        for (const file of req.files) {
          file.url = `/uploads/${file.filename}`;
        }
      }
    }
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { upload, processImageUpload };
