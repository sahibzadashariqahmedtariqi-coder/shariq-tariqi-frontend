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

  const { width = 300, height, quality = 60, format = 'auto' } = options;

  // Build transformation string - more aggressive optimization
  let transformation = `f_${format},q_${quality}`;
  
  if (width) {
    transformation += `,w_${width}`;
  }
  
  if (height) {
    transformation += `,h_${height}`;
  }
  
  // Add aggressive optimization flags
  transformation += ',c_fill,g_auto,fl_lossy.progressive';

  // Insert transformation into Cloudinary URL
  const uploadIndex = url.indexOf('/upload/');
  
  if (uploadIndex !== -1) {
    const beforeUpload = url.substring(0, uploadIndex + 8);
    const afterUpload = url.substring(uploadIndex + 8);
    
    // Remove existing transformations if any
    const parts = afterUpload.split('/');
    let filename = afterUpload;
    
    // Check if first part looks like a transformation (contains comma or specific patterns)
    if (parts.length > 1 && (parts[0].includes(',') || parts[0].match(/^[a-z]_/))) {
      // Skip existing transformation
      filename = parts.slice(1).join('/');
    }
    
    return `${beforeUpload}${transformation}/${filename}`;
  }

  return url;
}

// Preset sizes for common use cases - BALANCED QUALITY
export const imagePresets = {
  thumbnail: { width: 100, height: 100, quality: 70 },
  productCard: { width: 400, quality: 80 },
  productDetail: { width: 800, quality: 85 },
  hero: { width: 1000, quality: 80 },
  avatar: { width: 80, height: 80, quality: 70 },
};

// Helper function with presets
export function getOptimizedImageUrl(
  url: string,
  preset: keyof typeof imagePresets = 'productCard'
): string {
  return optimizeCloudinaryUrl(url, imagePresets[preset]);
}
