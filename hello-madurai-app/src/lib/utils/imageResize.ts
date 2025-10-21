import sharp from 'sharp'
import path from 'path'
import fs from 'fs'

// Target image resolution
export const IMAGE_CONFIG = {
  news: {
    width: 1280,
    height: 720,
    quality: 85,
  },
  ads: {
    width: 1280,
    height: 720,
    quality: 90,
  },
  thumbnail: {
    width: 1280,
    height: 720,
    quality: 80,
  },
}

/**
 * Resize and optimize image to target dimensions
 */
export async function resizeImage(
  inputPath: string,
  outputPath: string,
  config: { width: number; height: number; quality: number }
): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // Process image
    await sharp(inputPath)
      .resize(config.width, config.height, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .webp({ quality: config.quality })
      .toFile(outputPath)

    return { success: true, path: outputPath }
  } catch (error) {
    console.error('Image resize error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Validate image dimensions
 */
export async function validateImageDimensions(
  filePath: string,
  targetWidth: number,
  targetHeight: number
): Promise<{ valid: boolean; actual: { width: number; height: number }; needsResize: boolean }> {
  try {
    const metadata = await sharp(filePath).metadata()
    const width = metadata.width || 0
    const height = metadata.height || 0

    const valid = width === targetWidth && height === targetHeight
    const needsResize = !valid

    return {
      valid,
      actual: { width, height },
      needsResize,
    }
  } catch (error) {
    console.error('Image validation error:', error)
    throw error
  }
}

/**
 * Generate thumbnail from image
 */
export async function generateThumbnail(
  inputPath: string,
  outputPath: string
): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    const outputDir = path.dirname(outputPath)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    await sharp(inputPath)
      .resize(IMAGE_CONFIG.thumbnail.width, IMAGE_CONFIG.thumbnail.height, {
        fit: 'cover',
      })
      .webp({ quality: IMAGE_CONFIG.thumbnail.quality })
      .toFile(outputPath)

    return { success: true, path: outputPath }
  } catch (error) {
    console.error('Thumbnail generation error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Get image file size in bytes
 */
export async function getImageSize(filePath: string): Promise<number> {
  const stats = fs.statSync(filePath)
  return stats.size
}

/**
 * Convert image size to human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

