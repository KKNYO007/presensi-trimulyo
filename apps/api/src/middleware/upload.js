const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/env');

// Ensure upload directories exist
const selfiesDir = path.join(config.upload.uploadDir, 'selfies');
const activitiesDir = path.join(config.upload.uploadDir, 'activities');

[selfiesDir, activitiesDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configure multer storage - Use memory storage for Supabase upload
const storage = multer.memoryStorage();

// File filter - only allow images
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Hanya file gambar (JPEG, PNG, WebP) yang diperbolehkan'), false);
    }
};

// Configure multer instance
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: config.upload.maxFileSizeMb * 1024 * 1024, // Convert MB to bytes
    },
});

// Upload middleware for selfie (single file)
const uploadSelfie = upload.single('selfie');

// Upload middleware for activity photos (max 3 files)
const uploadActivityPhotos = upload.array('photos', 3);

// Wrapper to handle multer errors
const handleUpload = (uploadMiddleware) => {
    return (req, res, next) => {
        uploadMiddleware(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        success: false,
                        message: `Ukuran file maksimal ${config.upload.maxFileSizeMb}MB`,
                    });
                }
                if (err.code === 'LIMIT_FILE_COUNT') {
                    return res.status(400).json({
                        success: false,
                        message: 'Maksimal 3 foto yang diperbolehkan',
                    });
                }
                return res.status(400).json({
                    success: false,
                    message: err.message,
                });
            } else if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message,
                });
            }
            next();
        });
    };
};

module.exports = {
    uploadSelfie: handleUpload(uploadSelfie),
    uploadActivityPhotos: handleUpload(uploadActivityPhotos),
};
