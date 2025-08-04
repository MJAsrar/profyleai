/**
 * Advanced font metrics calculation for precise PDF-web synchronization
 * Handles font loading, measurement, and caching for optimal performance
 */

interface FontMetrics {
  family: string
  size: number
  weight: string
  style: string
  lineHeight: number
  characterWidth: number
  ascent: number
  descent: number
  xHeight: number
}

interface CachedMeasurement {
  text: string
  width: number
  height: number
  lines: number
  timestamp: number
}

class FontMetricsCalculator {
  private canvas: HTMLCanvasElement | null = null
  private context: CanvasRenderingContext2D | null = null
  private measurementCache = new Map<string, CachedMeasurement>()
  private fontLoadPromises = new Map<string, Promise<void>>()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  
  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeCanvas()
    }
  }
  
  private initializeCanvas() {
    this.canvas = document.createElement('canvas')
    this.context = this.canvas.getContext('2d')
    
    // Set high DPI for accurate measurements
    const devicePixelRatio = window.devicePixelRatio || 1
    this.canvas.width = 1000 * devicePixelRatio
    this.canvas.height = 1000 * devicePixelRatio
    
    if (this.context) {
      this.context.scale(devicePixelRatio, devicePixelRatio)
      this.context.textBaseline = 'top'
    }
  }
  
  /**
   * Ensure font is loaded before measurement
   */
  async ensureFontLoaded(fontFamily: string, fontWeight = '400', fontStyle = 'normal'): Promise<void> {
    const fontKey = `${fontFamily}-${fontWeight}-${fontStyle}`
    
    if (this.fontLoadPromises.has(fontKey)) {
      return this.fontLoadPromises.get(fontKey)!
    }
    
    const loadPromise = new Promise<void>((resolve, reject) => {
      if (!document.fonts) {
        // Fallback for browsers without Font Loading API
        setTimeout(resolve, 100)
        return
      }
      
      const fontFace = new FontFace(
        fontFamily,
        `url(/fonts/${this.getFontPath(fontFamily, fontWeight, fontStyle)})`,
        { weight: fontWeight, style: fontStyle }
      )
      
      fontFace.load()
        .then(() => {
          document.fonts.add(fontFace)
          resolve()
        })
        .catch(() => {
          // Font loading failed, continue with fallback
          resolve()
        })
        
      // Timeout fallback
      setTimeout(resolve, 2000)
    })
    
    this.fontLoadPromises.set(fontKey, loadPromise)
    return loadPromise
  }
  
  private getFontPath(family: string, weight: string, style: string): string {
    // Map font families to their file paths
    const fontPaths: Record<string, Record<string, string>> = {
      'LibertinusSerif': {
        '400-normal': 'Libertinus_Serif/LibertinusSerif-Regular.ttf',
        '700-normal': 'Libertinus_Serif/LibertinusSerif-Bold.ttf',
        '400-italic': 'Libertinus_Serif/LibertinusSerif-Italic.ttf',
        '700-italic': 'Libertinus_Serif/LibertinusSerif-BoldItalic.ttf',
      },
      'JetBrainsMono': {
        '400-normal': 'JetBrains_Mono/static/JetBrainsMono-Regular.ttf',
        '700-normal': 'JetBrains_Mono/static/JetBrainsMono-Bold.ttf',
        '400-italic': 'JetBrains_Mono/static/JetBrainsMono-Italic.ttf',
        '700-italic': 'JetBrains_Mono/static/JetBrainsMono-BoldItalic.ttf',
      },
      'Inter': {
        '400-normal': 'Inter/static/Inter_18pt-Regular.ttf',
        '700-normal': 'Inter/static/Inter_18pt-Bold.ttf',
        '400-italic': 'Inter/static/Inter_18pt-Italic.ttf',
        '700-italic': 'Inter/static/Inter_18pt-BoldItalic.ttf',
      }
    }
    
    const key = `${weight}-${style}`
    return fontPaths[family]?.[key] || fontPaths[family]?.['400-normal'] || 'Inter/static/Inter_18pt-Regular.ttf'
  }
  
  /**
   * Get detailed font metrics for precise layout calculations
   */
  async getFontMetrics(fontFamily: string, fontSize: number, fontWeight = '400', fontStyle = 'normal'): Promise<FontMetrics> {
    await this.ensureFontLoaded(fontFamily, fontWeight, fontStyle)
    
    if (!this.context) {
      throw new Error('Canvas context not available')
    }
    
    const font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`
    this.context.font = font
    
    // Measure various characters to get average metrics
    const testChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const measurements = testChars.split('').map(char => this.context!.measureText(char))
    
    const avgCharWidth = measurements.reduce((sum, m) => sum + m.width, 0) / measurements.length
    
    // Use 'M' as a representative character for height measurements
    const mMetrics = this.context.measureText('M')
    const lineHeight = fontSize * 1.2 // Standard line height multiplier
    
    return {
      family: fontFamily,
      size: fontSize,
      weight: fontWeight,
      style: fontStyle,
      lineHeight,
      characterWidth: avgCharWidth,
      ascent: mMetrics.actualBoundingBoxAscent || fontSize * 0.8,
      descent: mMetrics.actualBoundingBoxDescent || fontSize * 0.2,
      xHeight: fontSize * 0.5 // Approximate x-height
    }
  }
  
  /**
   * Measure text width with high precision
   */
  async measureTextWidth(
    text: string, 
    fontFamily: string, 
    fontSize: number, 
    fontWeight = '400', 
    fontStyle = 'normal'
  ): Promise<number> {
    const cacheKey = `${text}-${fontFamily}-${fontSize}-${fontWeight}-${fontStyle}`
    const cached = this.measurementCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.width
    }
    
    await this.ensureFontLoaded(fontFamily, fontWeight, fontStyle)
    
    if (!this.context) {
      return text.length * fontSize * 0.6 // Fallback estimation
    }
    
    const font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`
    this.context.font = font
    
    const metrics = this.context.measureText(text)
    const width = metrics.width
    
    // Cache the measurement
    this.measurementCache.set(cacheKey, {
      text,
      width,
      height: fontSize,
      lines: 1,
      timestamp: Date.now()
    })
    
    return width
  }
  
  /**
   * Calculate text layout for multi-line text
   */
  async calculateTextLayout(
    text: string,
    fontFamily: string,
    fontSize: number,
    maxWidth: number,
    lineHeight?: number,
    fontWeight = '400',
    fontStyle = 'normal'
  ): Promise<{
    lines: string[]
    totalHeight: number
    maxLineWidth: number
  }> {
    const effectiveLineHeight = lineHeight || fontSize * 1.4
    const words = text.split(/\s+/)
    const lines: string[] = []
    let currentLine = ''
    let maxLineWidth = 0
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const lineWidth = await this.measureTextWidth(testLine, fontFamily, fontSize, fontWeight, fontStyle)
      
      if (lineWidth <= maxWidth) {
        currentLine = testLine
        maxLineWidth = Math.max(maxLineWidth, lineWidth)
      } else {
        if (currentLine) {
          lines.push(currentLine)
          currentLine = word
        } else {
          // Word is too long, force it to fit
          lines.push(word)
          currentLine = ''
        }
      }
    }
    
    if (currentLine) {
      lines.push(currentLine)
    }
    
    return {
      lines,
      totalHeight: lines.length * effectiveLineHeight,
      maxLineWidth
    }
  }
  
  /**
   * Convert CSS font size to pixels
   */
  convertFontSizeToPixels(cssSize: string): number {
    if (cssSize.endsWith('px')) {
      return parseFloat(cssSize)
    }
    if (cssSize.endsWith('pt')) {
      return parseFloat(cssSize) * 4/3 // 1pt = 4/3px at 96 DPI
    }
    if (cssSize.endsWith('em')) {
      return parseFloat(cssSize) * 16 // Assume 16px base
    }
    if (cssSize.endsWith('rem')) {
      return parseFloat(cssSize) * 16 // Assume 16px root
    }
    
    // Try to parse as number (assume pixels)
    const num = parseFloat(cssSize)
    return isNaN(num) ? 16 : num
  }
  
  /**
   * Clear old cache entries
   */
  clearCache() {
    const now = Date.now()
    for (const [key, cached] of this.measurementCache.entries()) {
      if (now - cached.timestamp > this.CACHE_DURATION) {
        this.measurementCache.delete(key)
      }
    }
  }
}

// Singleton instance
let fontMetricsCalculator: FontMetricsCalculator | null = null

export function getFontMetricsCalculator(): FontMetricsCalculator {
  if (!fontMetricsCalculator) {
    fontMetricsCalculator = new FontMetricsCalculator()
  }
  return fontMetricsCalculator
}

// Utility functions
export async function measureText(
  text: string,
  fontFamily: string,
  fontSize: string | number,
  fontWeight = '400',
  fontStyle = 'normal'
): Promise<number> {
  const calculator = getFontMetricsCalculator()
  const pixelSize = typeof fontSize === 'string' 
    ? calculator.convertFontSizeToPixels(fontSize)
    : fontSize
    
  return calculator.measureTextWidth(text, fontFamily, pixelSize, fontWeight, fontStyle)
}

export async function calculateMultiLineText(
  text: string,
  fontFamily: string,
  fontSize: string | number,
  maxWidth: number,
  lineHeight?: number,
  fontWeight = '400',
  fontStyle = 'normal'
) {
  const calculator = getFontMetricsCalculator()
  const pixelSize = typeof fontSize === 'string' 
    ? calculator.convertFontSizeToPixels(fontSize)
    : fontSize
    
  return calculator.calculateTextLayout(
    text, 
    fontFamily, 
    pixelSize, 
    maxWidth, 
    lineHeight, 
    fontWeight, 
    fontStyle
  )
}

export { FontMetricsCalculator }