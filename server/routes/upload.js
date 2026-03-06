import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import User from '../models/User.js';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Use memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Helper function to upload buffer to cloudinary
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'social-media/avatars',
        resource_type: 'auto',
        ...options
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// Upload profile picture
router.post('/avatar', verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Delete old avatar from cloudinary if exists
    const user = await User.findById(req.user._id);
    if (user.avatar?.public_id) {
      try {
        await cloudinary.uploader.destroy(user.avatar.public_id);
      } catch (destroyError) {
        console.error('Error deleting old avatar:', destroyError);
        // Continue even if delete fails
      }
    }

    // Upload new avatar
    const result = await uploadToCloudinary(req.file.buffer, {
      public_id: `avatar_${req.user._id}_${Date.now()}`,
      width: 300,
      height: 300,
      crop: 'fill'
    });

    // Update user in database
    user.avatar = {
      public_id: result.public_id,
      url: result.secure_url
    };
    await user.save();

    res.json({ 
      message: 'Profile picture updated successfully',
      avatar: user.avatar 
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete profile picture
router.delete('/avatar', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user.avatar?.public_id) {
      try {
        await cloudinary.uploader.destroy(user.avatar.public_id);
      } catch (destroyError) {
        console.error('Error deleting avatar:', destroyError);
        // Continue even if delete fails
      }
    }
    
    user.avatar = {
      public_id: null,
      url: 'https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png'
    };
    await user.save();

    res.json({ 
      message: 'Profile picture removed',
      avatar: user.avatar 
    });
  } catch (error) {
    console.error('Error deleting avatar:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;