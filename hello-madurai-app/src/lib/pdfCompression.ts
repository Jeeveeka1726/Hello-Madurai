/**
 * PDF Compression Service using 11zon API
 * https://bigpdf.11zon.com/en/compress-pdf/compress-pdf-to-chosen-size.php
 */

export interface CompressionOptions {
  targetSizeKB?: number // Target size in KB (e.g., 1000 for 1MB)
  quality?: 'low' | 'medium' | 'high' // Compression quality
}

export interface CompressionResult {
  success: boolean
  compressedUrl?: string
  originalSize?: number
  compressedSize?: number
  error?: string
}

/**
 * Compress PDF using 11zon API
 * Note: This is a conceptual implementation. The actual 11zon API may require different parameters.
 */
export async function compressPDF(
  file: File, 
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  try {
    const { targetSizeKB = 1000, quality = 'medium' } = options
    
    // Check if file is actually a PDF
    if (file.type !== 'application/pdf') {
      return {
        success: false,
        error: 'File must be a PDF'
      }
    }

    // Check original file size
    const originalSizeKB = Math.round(file.size / 1024)
    console.log(`📄 Original PDF size: ${originalSizeKB}KB`)

    // If file is already smaller than target, return as-is
    if (originalSizeKB <= targetSizeKB) {
      console.log(`✅ PDF already within target size (${originalSizeKB}KB <= ${targetSizeKB}KB)`)
      return {
        success: true,
        compressedUrl: URL.createObjectURL(file),
        originalSize: originalSizeKB,
        compressedSize: originalSizeKB
      }
    }

    // Prepare form data for 11zon API
    const formData = new FormData()
    formData.append('file', file)
    formData.append('target_size', targetSizeKB.toString())
    formData.append('quality', quality)

    console.log(`🔄 Compressing PDF from ${originalSizeKB}KB to target ${targetSizeKB}KB...`)

    // Use our API endpoint which proxies to 11zon
    const response = await fetch('/api/compress-pdf', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Compression API failed: ${response.status}`)
    }

    const result = await response.json()
    
    if (result.success && result.compressed_url) {
      console.log(`✅ PDF compressed successfully: ${result.original_size}KB → ${result.compressed_size}KB`)
      
      return {
        success: true,
        compressedUrl: result.compressed_url,
        originalSize: result.original_size,
        compressedSize: result.compressed_size
      }
    } else {
      throw new Error(result.error || 'Compression failed')
    }

  } catch (error) {
    console.error('❌ PDF compression error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown compression error'
    }
  }
}

/**
 * Fallback compression using browser-based techniques
 * This is a basic implementation that doesn't actually compress but validates
 */
export async function fallbackCompression(file: File): Promise<CompressionResult> {
  try {
    const sizeKB = Math.round(file.size / 1024)
    
    // For now, just return the original file
    // In a real implementation, you might use PDF-lib or similar
    return {
      success: true,
      compressedUrl: URL.createObjectURL(file),
      originalSize: sizeKB,
      compressedSize: sizeKB
    }
  } catch (error) {
    return {
      success: false,
      error: 'Fallback compression failed'
    }
  }
}

/**
 * Get recommended compression settings based on file size
 */
export function getRecommendedSettings(fileSizeKB: number): CompressionOptions {
  if (fileSizeKB > 10000) { // > 10MB
    return { targetSizeKB: 2000, quality: 'medium' } // Compress to 2MB
  } else if (fileSizeKB > 5000) { // > 5MB
    return { targetSizeKB: 1500, quality: 'medium' } // Compress to 1.5MB
  } else if (fileSizeKB > 2000) { // > 2MB
    return { targetSizeKB: 1000, quality: 'high' } // Compress to 1MB
  } else {
    return { targetSizeKB: fileSizeKB, quality: 'high' } // Keep original size
  }
}
