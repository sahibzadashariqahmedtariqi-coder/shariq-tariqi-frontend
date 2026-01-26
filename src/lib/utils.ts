import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function getYouTubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Cloudinary image optimization helper
// Adds width, quality auto, and format auto for faster loading
export function optimizeCloudinaryUrl(url: string, width: number = 400): string {
  if (!url) return url
  
  // Check if it's a Cloudinary URL
  if (!url.includes('cloudinary.com')) return url
  
  // Check if transformations already exist
  if (url.includes('/upload/w_') || url.includes('/upload/q_') || url.includes('/upload/f_')) {
    return url
  }
  
  // Add transformations: width, quality auto, format auto
  // Format: /upload/w_400,q_auto,f_auto/
  const transformation = `w_${width},q_auto,f_auto`
  
  // Insert transformation after /upload/
  return url.replace('/upload/', `/upload/${transformation}/`)
}

// Get optimized image URL for product thumbnails
export function getProductThumbnail(url: string): string {
  return optimizeCloudinaryUrl(url, 400)
}

// Get optimized image URL for product detail page
export function getProductImage(url: string): string {
  return optimizeCloudinaryUrl(url, 800)
}

