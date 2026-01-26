/**
 * Cloudinary Image Optimization Helper
 * Transforms Cloudinary URLs to optimized versions with smaller file sizes
 */

export function optimizeCloudinaryUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  } = {}
): string {
  // Return original URL if not a Cloudinary URL
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const { width = 400, height, quality = 80, format = 'auto' } = options;

  // Build transformation string
  let transformation = `f_${format},q_${quality}`;
  
  if (width) {
    transformation += `,w_${width}`;
  }
  
  if (height) {
    transformation += `,h_${height}`;
  }
  
  // Add auto crop and optimization
  transformation += ',c_limit,dpr_auto';

  // Insert transformation into Cloudinary URL
  // URL format: https://res.cloudinary.com/CLOUD_NAME/image/upload/EXISTING_TRANSFORMS/FILE
  const uploadIndex = url.indexOf('/upload/');
  
  if (uploadIndex !== -1) {
    const beforeUpload = url.substring(0, uploadIndex + 8); // includes '/upload/'
    const afterUpload = url.substring(uploadIndex + 8);
    
    // Check if there are existing transformations
    // If afterUpload starts with 'v' followed by numbers, it's a version, not transform
    if (afterUpload.match(/^v\d+\//)) {
      // Has version number, insert transform before version
      return `${beforeUpload}${transformation}/${afterUpload}`;
    } else if (afterUpload.includes('/')) {
      // May have existing transforms
      return `${beforeUpload}${transformation}/${afterUpload}`;
    } else {
      // No transforms, just filename
      return `${beforeUpload}${transformation}/${afterUpload}`;
    }
  }

  // Return original if can't parse
  return url;
}

// Preset sizes for common use cases
export const imagePresets = {
  thumbnail: { width: 150, height: 150, quality: 70 },
  productCard: { width: 400, quality: 80 },
  productDetail: { width: 800, quality: 85 },
  hero: { width: 1200, quality: 85 },
  avatar: { width: 100, height: 100, quality: 75 },
};

// Helper function with presets
export function getOptimizedImageUrl(
  url: string,
  preset: keyof typeof imagePresets = 'productCard'
): string {
  return optimizeCloudinaryUrl(url, imagePresets[preset]);
}
