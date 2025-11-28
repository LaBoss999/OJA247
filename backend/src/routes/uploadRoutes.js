import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

const router = express.Router();

// Configure Cloudinary HERE (after dotenv has loaded)
  cloudinary.config({
  cloud_name: 'darbw1ovq',
  api_key: '271998152415255',
  api_secret: 'p4yqmwRweD4FfuWQbFzx9xj0XQA',
  secure: true
});

// Use memory storage for multer
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Helper function to upload to Cloudinary
const uploadToCloudinary = async (fileBuffer, filename) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'oja247',
        public_id: `${Date.now()}-${filename.split('.')[0]}`,
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// Upload single image
router.post('/single', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);

    res.json({
      message: 'Image uploaded successfully',
      url: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Upload multiple images (max 5)
router.post('/multiple', upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadPromises = req.files.map(file => 
      uploadToCloudinary(file.buffer, file.originalname)
    );

    const results = await Promise.all(uploadPromises);

    const uploadedImages = results.map(result => ({
      url: result.secure_url,
      publicId: result.public_id
    }));

    res.json({
      message: `${req.files.length} images uploaded successfully`,
      images: uploadedImages
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;