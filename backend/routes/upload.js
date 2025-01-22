const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const path = require('path');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images only!');
        }
    }
});

// Upload endpoint
router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Convert buffer to base64
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
            resource_type: 'auto',
            folder: 'ceramics'
        });

        res.json({
            message: 'File uploaded successfully',
            imageUrl: result.secure_url
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            message: 'Error uploading file',
            error: error.message
        });
    }
});

module.exports = router; 