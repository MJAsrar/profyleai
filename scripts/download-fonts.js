/**
 * Font Download Helper Script
 * 
 * This script helps you download Google Fonts for use in PDF generation.
 * Run this script in Node.js environment to download fonts automatically.
 */

const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')

// Font configurations
const FONTS_TO_DOWNLOAD = [
  {
    family: 'Inter',
    weights: ['400', '500', '600', '700'],
    variants: ['normal']
  },
  {
    family: 'Crimson Text',
    weights: ['400', '600', '700'],
    variants: ['normal']
  },
  {
    family: 'JetBrains Mono',
    weights: ['400', '500', '600', '700'],
    variants: ['normal']
  },
  {
    family: 'Poppins',
    weights: ['400', '500', '600', '700'],
    variants: ['normal']
  },
  {
    family: 'Playfair Display',
    weights: ['400', '500', '600', '700', '900'],
    variants: ['normal']
  },
  {
    family: 'Montserrat',
    weights: ['400', '500', '600', '700', '800', '900'],
    variants: ['normal']
  },
  {
    family: 'Nunito Sans',
    weights: ['400', '500', '600', '700'],
    variants: ['normal']
  }
]

// Create fonts directory
const FONTS_DIR = path.join(__dirname, '..', 'public', 'fonts')

function createFontsDirectory() {
  if (!fs.existsSync(FONTS_DIR)) {
    fs.mkdirSync(FONTS_DIR, { recursive: true })
    console.log('📁 Created fonts directory:', FONTS_DIR)
  }
}

function createFontFamilyDirectory(family) {
  const familyDir = path.join(FONTS_DIR, family.toLowerCase().replace(/\s+/g, '-'))
  if (!fs.existsSync(familyDir)) {
    fs.mkdirSync(familyDir, { recursive: true })
    console.log('📁 Created directory:', familyDir)
  }
  return familyDir
}

async function getCSSFromGoogleFonts(family, weights) {
  return new Promise((resolve, reject) => {
    const weightsParam = weights.join(';')
    const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weightsParam}&display=swap`
    
    console.log(`  🔍 Getting CSS from: ${url}`)
    
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    }
    
    https.get(url, options, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`))
        return
      }
      
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        console.log(`  ✅ Got CSS data (${data.length} chars)`)
        resolve(data)
      })
    }).on('error', reject)
  })
}

function extractFontURLs(css) {
  console.log(`  🔍 Extracting font URLs from CSS...`)
  
  // Look for @font-face rules and extract URLs
  const fontFaceRegex = /@font-face\s*{[^}]+}/g
  const urlRegex = /src:\s*url\(([^)]+)\)/
  const weightRegex = /font-weight:\s*(\d+)/
  
  const fonts = []
  const fontFaces = css.match(fontFaceRegex) || []
  
  console.log(`  📋 Found ${fontFaces.length} @font-face rules`)
  
  fontFaces.forEach((fontFace, index) => {
    const urlMatch = fontFace.match(urlRegex)
    const weightMatch = fontFace.match(weightRegex)
    
    if (urlMatch) {
      const url = urlMatch[1].replace(/['"]/g, '')
      const weight = weightMatch ? weightMatch[1] : '400'
      
      if (url.includes('gstatic.com') && (url.includes('.ttf') || url.includes('.woff2'))) {
        fonts.push({ url, weight })
        console.log(`    📄 Font ${index + 1}: weight ${weight} -> ${url}`)
      }
    }
  })
  
  return fonts
}

async function downloadFont(url, filepath) {
  return new Promise((resolve, reject) => {
    console.log(`    📥 Downloading to: ${filepath}`)
    
    const file = fs.createWriteStream(filepath)
    const protocol = url.startsWith('https') ? https : http
    
    const request = protocol.get(url, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        console.log(`    🔄 Redirecting to: ${response.headers.location}`)
        file.close()
        downloadFont(response.headers.location, filepath).then(resolve).catch(reject)
        return
      }
      
      if (response.statusCode !== 200) {
        file.close()
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`))
        return
      }
      
      response.pipe(file)
      
      file.on('finish', () => {
        file.close()
        const stats = fs.statSync(filepath)
        console.log(`    ✅ Downloaded ${filepath} (${stats.size} bytes)`)
        resolve()
      })
      
      file.on('error', (err) => {
        file.close()
        fs.unlink(filepath, () => {}) // Delete the file async
        reject(err)
      })
    })
    
    request.on('error', (err) => {
      file.close()
      fs.unlink(filepath, () => {}) // Delete the file async
      reject(err)
    })
    
    // Set timeout
    request.setTimeout(30000, () => {
      file.close()
      fs.unlink(filepath, () => {})
      reject(new Error('Download timeout'))
    })
  })
}

async function downloadFontFamily(fontConfig) {
  console.log(`\n📥 Downloading ${fontConfig.family}...`)
  
  try {
    const familyDir = createFontFamilyDirectory(fontConfig.family)
    const css = await getCSSFromGoogleFonts(fontConfig.family, fontConfig.weights)
    const fonts = extractFontURLs(css)
    
    if (fonts.length === 0) {
      console.log(`  ⚠️ No fonts found for ${fontConfig.family}`)
      return
    }
    
    console.log(`  📦 Found ${fonts.length} font files for ${fontConfig.family}`)
    
    for (const font of fonts) {
      const weight = font.weight
      const familyName = fontConfig.family.toLowerCase().replace(/\s+/g, '-')
      
      // Determine file extension based on URL
      let extension = '.ttf'
      if (font.url.includes('.woff2')) {
        extension = '.woff2'
      } else if (font.url.includes('.woff')) {
        extension = '.woff'
      }
      
      const filename = `${familyName}-${weight}${extension}`
      const filepath = path.join(familyDir, filename)
      
      console.log(`  📄 Downloading ${filename} (weight: ${weight})...`)
      
      try {
        await downloadFont(font.url, filepath)
        
        // If we downloaded woff2, try to convert to ttf or warn user
        if (extension === '.woff2') {
          console.log(`  ⚠️ Downloaded ${filename} as WOFF2. For PDF support, you may need TTF format.`)
        }
        
      } catch (error) {
        console.error(`    ❌ Failed to download ${filename}:`, error.message)
      }
    }
    
    console.log(`✅ Completed ${fontConfig.family}`)
    
  } catch (error) {
    console.error(`❌ Failed to download ${fontConfig.family}:`, error.message)
  }
}

async function downloadAllFonts() {
  console.log('🚀 Starting font download process...')
  createFontsDirectory()
  
  for (const fontConfig of FONTS_TO_DOWNLOAD) {
    await downloadFontFamily(fontConfig)
  }
  
  console.log('\n✅ Font download process completed!')
  console.log('\n📁 Fonts saved to:', FONTS_DIR)
  console.log('\n🔧 Next steps:')
  console.log('1. Restart your Next.js development server')
  console.log('2. Test PDF generation with custom fonts')
  console.log('3. Check browser console for font loading logs')
}

// Manual download instructions
function printManualInstructions() {
  console.log('\n📝 MANUAL DOWNLOAD INSTRUCTIONS:')
  console.log('If the automatic download fails, you can download fonts manually:')
  console.log('\n1. Visit these Google Fonts URLs:')
  
  FONTS_TO_DOWNLOAD.forEach(font => {
    const googleUrl = `https://fonts.google.com/specimen/${font.family.replace(/\s+/g, '+')}`
    console.log(`   - ${font.family}: ${googleUrl}`)
  })
  
  console.log('\n2. For each font:')
  console.log('   - Click "Download family"')
  console.log('   - Extract TTF files')
  console.log('   - Rename files to: fontname-weight.ttf (e.g., inter-400.ttf)')
  console.log('   - Place in: public/fonts/fontname/ directory')
  
  console.log('\n3. Expected file structure:')
  console.log('   public/fonts/')
  console.log('   ├── inter/')
  console.log('   │   ├── inter-400.ttf')
  console.log('   │   ├── inter-500.ttf')
  console.log('   │   ├── inter-600.ttf')
  console.log('   │   └── inter-700.ttf')
  console.log('   ├── crimson-text/')
  console.log('   │   ├── crimson-text-400.ttf')
  console.log('   │   └── crimson-text-700.ttf')
  console.log('   └── ... (other fonts)')
}

// Run the script
if (require.main === module) {
  downloadAllFonts().catch(error => {
    console.error('❌ Font download failed:', error)
    printManualInstructions()
  })
}

module.exports = {
  downloadAllFonts,
  printManualInstructions,
  FONTS_TO_DOWNLOAD
}