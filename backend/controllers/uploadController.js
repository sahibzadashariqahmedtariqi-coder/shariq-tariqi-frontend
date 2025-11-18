import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

// Helper function to convert buffer to stream
const bufferToStream = (buffer) => {
  const readable = new Readable();
  readable._read = () => {};
  readable.push(buffer);
  readable.push(null);
  return readable;
};

// @desc    Upload image to Cloudinary
// @route   POST /api/upload/image
// @access  Private/Admin
export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    // Get folder from query params (default: 'general')
    const folder = req.query.folder || 'general';
    
    // Upload to Cloudinary using stream
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `shariq-website/${folder}`,
          resource_type: 'auto',
          transformation: [
            { width: 1200, height: 800, crop: 'limit' }, // Max dimensions
            { quality: 'auto' }, // Auto quality optimization
            { fetch_format: 'auto' } // Auto format (WebP when supported)
          ]
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      bufferToStream(req.file.buffer).pipe(uploadStream);
    });

    const result = await uploadPromise;

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    next(error);
  }
};

// @desc    Delete image from Cloudinary
// @route   DELETE /api/upload/image
// @access  Private/Admin
export const deleteImage = async (req, res, next) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide image public ID'
      });
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      res.status(200).json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to delete image'
      });
    }
  } catch (error) {
    console.error('Delete error:', error);
    next(error);
  }
};
