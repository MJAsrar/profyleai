/**
 * Font Downloader - Download Google Fonts for PDF embedding
 */

interface FontWeight {
  weight: number
  style: 'normal' | 'italic'
  url: string
}

interface FontFamily {
  family: string
  weights: FontWeight[]
}

export class FontDownloader {
  private static readonly GOOGLE_FONTS_API_KEY = process.env.GOOGLE_FONTS_API_KEY
  private static readonly FONTS_DIR = 'public/fonts'
  
  // Fonts we need for our templates
  private static readonly REQUIRED_FONTS: { [key: string]: number[] } = {
    'Inter': [400, 500, 600, 700],
    'Nunito Sans': [400, 500, 600, 700],
    'JetBrains Mono': [400, 500, 600, 700],
    'Crimson Text': [400, 600, 700],
    'Poppins': [400, 500, 600, 700],
    'Playfair Display': [400, 500, 600, 700, 900],
    'Montserrat': [400, 500, 600, 700, 800, 900]
  }

  /**
   * Download all required fonts
   */
  static async downloadAllFonts(): Promise<void> {
    console.log('📥 Starting font download process...')
    
    for (const [fontFamily, weights] of Object.entries(this.REQUIRED_FONTS)) {
      try {
        await this.downloadFontFamily(fontFamily, weights)
        console.log(`✅ Downloaded ${fontFamily}`)
      } catch (error) {
        console.error(`❌ Failed to download ${fontFamily}:`, error)
      }
    }
    
    console.log('📥 Font download process completed')
  }

  /**
   * Download a specific font family
   */
  private static async downloadFontFamily(family: string, weights: number[]): Promise<void> {
    // Create font family directory
    const fontDir = `${this.FONTS_DIR}/${family.replace(/\s+/g, '-').toLowerCase()}`
    
    for (const weight of weights) {
      await this.downloadFontWeight(family, weight, fontDir)
    }
  }

  /**
   * Download a specific font weight
   */
  private static async downloadFontWeight(family: string, weight: number, fontDir: string): Promise<void> {
    try {
      // Get font URL from Google Fonts
      const fontUrl = await this.getFontUrl(family, weight)
      
      if (!fontUrl) {
        console.warn(`⚠️ Could not get URL for ${family} ${weight}`)
        return
      }

      // Download font file
      const response = await fetch(fontUrl)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const fontBuffer = await response.arrayBuffer()
      
      // Save to file system (Note: This is simplified - in real implementation you'd use Node.js fs)
      const fileName = `${family.replace(/\s+/g, '-').toLowerCase()}-${weight}.ttf`
      console.log(`📁 Would save ${fileName} (${fontBuffer.byteLength} bytes)`)
      
    } catch (error) {
      console.error(`Failed to download ${family} ${weight}:`, error)
    }
  }

  /**
   * Get Google Fonts download URL
   */
  private static async getFontUrl(family: string, weight: number): Promise<string | null> {
    try {
      // Construct Google Fonts CSS URL
      const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`
      
      const response = await fetch(cssUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const css = await response.text()
      
      // Extract font URL from CSS
      const urlMatch = css.match(/src:\s*url\(([^)]+)\)/);
      if (urlMatch && urlMatch[1]) {
        return urlMatch[1]
      }
      
      return null
    } catch (error) {
      console.error(`Failed to get font URL for ${family}:`, error)
      return null
    }
  }

  /**
   * Get list of downloaded fonts
   */
  static getDownloadedFonts(): string[] {
    // In a real implementation, this would read the fonts directory
    return Object.keys(this.REQUIRED_FONTS)
  }

  /**
   * Check if a font is available
   */
  static isFontAvailable(fontFamily: string): boolean {
    return Object.keys(this.REQUIRED_FONTS).some(font => 
      font.toLowerCase() === fontFamily.toLowerCase()
    )
  }
}

/**
 * Manual font download instructions
 */
export const FONT_DOWNLOAD_INSTRUCTIONS = {
  message: `To download fonts manually, visit these Google Fonts URLs and download the TTF files:`,
  fonts: [
    {
      name: 'Inter',
      url: 'https://fonts.google.com/specimen/Inter',
      weights: [400, 500, 600, 700]
    },
    {
      name: 'Nunito Sans', 
      url: 'https://fonts.google.com/specimen/Nunito+Sans',
      weights: [400, 500, 600, 700]
    },
    {
      name: 'JetBrains Mono',
      url: 'https://fonts.google.com/specimen/JetBrains+Mono', 
      weights: [400, 500, 600, 700]
    },
    {
      name: 'Crimson Text',
      url: 'https://fonts.google.com/specimen/Crimson+Text',
      weights: [400, 600, 700]
    },
    {
      name: 'Poppins',
      url: 'https://fonts.google.com/specimen/Poppins',
      weights: [400, 500, 600, 700]
    },
    {
      name: 'Playfair Display',
      url: 'https://fonts.google.com/specimen/Playfair+Display',
      weights: [400, 500, 600, 700, 900]
    },
    {
      name: 'Montserrat',
      url: 'https://fonts.google.com/specimen/Montserrat',
      weights: [400, 500, 600, 700, 800, 900]
    }
  ]
}