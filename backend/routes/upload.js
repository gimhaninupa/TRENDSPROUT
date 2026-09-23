import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Memory storage for Multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// Helper to configure Cloudinary
const isCloudinaryConfigured = () => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    });
    return true;
  }
  return false;
};

// @desc    Upload single image to Cloudinary CDN or return base64
// @route   POST /api/upload
// @access  Public / Private
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file && !req.body.image) {
      return res.status(400).json({ status: 'fail', message: 'Please provide an image file or base64 string' });
    }

    // If Cloudinary is configured
    if (isCloudinaryConfigured()) {
      let uploadResult;
      if (req.file) {
        // Upload buffer via stream
        uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'trendsprout', transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }] },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(req.file.buffer);
        });
      } else if (req.body.image) {
        uploadResult = await cloudinary.uploader.upload(req.body.image, {
          folder: 'trendsprout',
          transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }],
        });
      }

      return res.json({
        status: 'success',
        message: 'Image uploaded to Cloudinary CDN successfully',
        data: {
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
          format: uploadResult.format,
          bytes: uploadResult.bytes,
        },
      });
    }

    // Fallback if Cloudinary credentials are not configured yet
    let fallbackUrl = '';
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      fallbackUrl = `data:${req.file.mimetype};base64,${b64}`;
    } else {
      fallbackUrl = req.body.image;
    }

    res.json({
      status: 'success',
      message: 'Image processed (Add Cloudinary credentials to store on global CDN)',
      data: {
        url: fallbackUrl,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;
