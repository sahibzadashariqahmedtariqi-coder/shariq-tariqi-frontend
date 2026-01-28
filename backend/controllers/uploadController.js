import cloudinary from '../config/cloudinary.js';
import { getMureedCloudinaryConfig } from '../config/mureedCloudinary.js';
import cloudinaryModule from 'cloudinary';
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

// @desc    Upload PDF to Cloudinary (no size limit, no transformation)
// @route   POST /api/upload/pdf
// @access  Private/Admin
export const uploadPdf = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF file'
      });
    }

    // Get folder from query params (default: 'pdfs')
    const folder = req.query.folder || 'pdfs';
    const fileSizeMB = (req.file.size / 1024 / 1024).toFixed(2);
    
    console.log('📤 Uploading PDF:', req.file.originalname, 'Size:', fileSizeMB, 'MB');
    
    // Check file size - Cloudinary free tier has 10MB limit for raw files
    if (req.file.size > 10 * 1024 * 1024) {
      console.log('⚠️ File too large for raw upload, trying as auto resource type...');
    }
    
    // Upload to Cloudinary using stream
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `shariq-website/${folder}`,
          resource_type: 'auto', // Changed to 'auto' - more flexible
          use_filename: true,
          unique_filename: true,
          timeout: 300000 // 5 minute timeout
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('✅ PDF uploaded successfully:', result.secure_url);
            resolve(result);
          }
        }
      );

      bufferToStream(req.file.buffer).pipe(uploadStream);
    });

    const result = await uploadPromise;

    // Use original Cloudinary URL - PDFs work with image/upload path
    const pdfUrl = result.secure_url;

    res.status(200).json({
      success: true,
      message: 'PDF uploaded successfully',
      data: {
        url: pdfUrl,
        publicId: result.public_id,
        format: result.format,
        size: result.bytes,
        originalFilename: req.file.originalname
      }
    });
  } catch (error) {
    console.error('PDF Upload error:', error.message || error);
    
    // Send more helpful error message
    if (error.message && error.message.includes('File size too large')) {
      return res.status(413).json({
        success: false,
        message: 'PDF file is too large. Please use the URL option instead - upload to Google Drive and paste the link.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to upload PDF. Try using the URL option - upload to Google Drive and paste the link.',
      error: error.message
    });
  }
};

// @desc    Get Cloudinary signature for direct upload
// @route   POST /api/upload/signature
// @access  Private/Admin
export const getUploadSignature = async (req, res, next) => {
  try {
    const { folder = 'pdfs' } = req.body;
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder: `shariq-website/${folder}`,
        resource_type: 'raw'
      },
      process.env.CLOUDINARY_API_SECRET
    );

    res.status(200).json({
      success: true,
      data: {
        signature,
        timestamp,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        folder: `shariq-website/${folder}`
      }
    });
  } catch (error) {
    console.error('Signature error:', error);
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

// @desc    Upload Mureed profile picture to separate Cloudinary
// @route   POST /api/upload/mureed-image
// @access  Public
export const uploadMureedImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    // Get Mureed Cloudinary config
    const mureedConfig = getMureedCloudinaryConfig();
    
    // Configure a fresh cloudinary instance for this upload
    const mureedCloudinary = cloudinaryModule.v2;
    mureedCloudinary.config(mureedConfig);

    // Upload to Mureed's separate Cloudinary account
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = mureedCloudinary.uploader.upload_stream(
        {
          folder: 'mureed-profiles',
          resource_type: 'image',
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' }
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

    // Re-configure main cloudinary after upload
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    res.status(200).json({
      success: true,
      message: 'Mureed image uploaded successfully',
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
    console.error('Mureed upload error:', error);
    // Re-configure main cloudinary on error too
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    next(error);
  }
};
