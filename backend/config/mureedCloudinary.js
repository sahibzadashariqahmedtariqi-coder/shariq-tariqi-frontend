import cloudinaryModule from 'cloudinary';

// Create a NEW separate Cloudinary instance for Mureed uploads
const mureedCloudinary = cloudinaryModule.v2;

let isConfigured = false;

// Configure with Mureed-specific credentials
const configureMureedCloudinary = () => {
  if (isConfigured) return mureedCloudinary;
  
  // Store the config for mureed cloudinary
  const mureedConfig = {
    cloud_name: process.env.MUREED_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.MUREED_CLOUDINARY_API_KEY,
    api_secret: process.env.MUREED_CLOUDINARY_API_SECRET,
  };

  console.log('✅ Mureed Cloudinary configured successfully');
  console.log(`☁️ Mureed Cloud Name: ${mureedConfig.cloud_name}`);
  
  isConfigured = true;
  
  return mureedConfig;
};

// Get mureed cloudinary config
export const getMureedCloudinaryConfig = () => ({
  cloud_name: process.env.MUREED_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.MUREED_CLOUDINARY_API_KEY,
  api_secret: process.env.MUREED_CLOUDINARY_API_SECRET,
});

export { configureMureedCloudinary };
export default mureedCloudinary;
