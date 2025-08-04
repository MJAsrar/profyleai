# Font Setup Guide

This guide helps you set up custom fonts for exact PDF matching with your resume templates.

## 📋 Required Fonts

Your templates use these fonts:
- **Inter** (Modern Professional)
- **Crimson Text** (Executive Classic) 
- **JetBrains Mono** (Tech Stack)
- **Poppins** (Creative Designer)
- **Playfair Display** (Artistic Portfolio)
- **Montserrat** (Bold Modern)
- **Nunito Sans** (Clean Minimalist)

## 🚀 Quick Setup (Option 1: Automatic)

1. **Run the download script:**
   ```bash
   cd scripts
   node download-fonts.js
   ```

2. **Restart your dev server:**
   ```bash
   npm run dev
   ```

3. **Test PDF generation** - fonts should now match web preview!

## 📥 Manual Setup (Option 2: If automatic fails)

### Step 1: Download Fonts from Google Fonts

Visit these URLs and download the font families:

1. **Inter**: https://fonts.google.com/specimen/Inter
2. **Crimson Text**: https://fonts.google.com/specimen/Crimson+Text
3. **JetBrains Mono**: https://fonts.google.com/specimen/JetBrains+Mono
4. **Poppins**: https://fonts.google.com/specimen/Poppins
5. **Playfair Display**: https://fonts.google.com/specimen/Playfair+Display
6. **Montserrat**: https://fonts.google.com/specimen/Montserrat
7. **Nunito Sans**: https://fonts.google.com/specimen/Nunito+Sans

### Step 2: Organize Font Files

Create this directory structure in your project:

```
public/fonts/
├── inter/
│   ├── inter-400.ttf
│   ├── inter-500.ttf
│   ├── inter-600.ttf
│   └── inter-700.ttf
├── crimson-text/
│   ├── crimson-text-400.ttf
│   ├── crimson-text-600.ttf
│   └── crimson-text-700.ttf
├── jetbrains-mono/
│   ├── jetbrains-mono-400.ttf
│   ├── jetbrains-mono-500.ttf
│   ├── jetbrains-mono-600.ttf
│   └── jetbrains-mono-700.ttf
├── poppins/
│   ├── poppins-400.ttf
│   ├── poppins-500.ttf
│   ├── poppins-600.ttf
│   └── poppins-700.ttf
├── playfair-display/
│   ├── playfair-display-400.ttf
│   ├── playfair-display-500.ttf
│   ├── playfair-display-600.ttf
│   ├── playfair-display-700.ttf
│   └── playfair-display-900.ttf
├── montserrat/
│   ├── montserrat-400.ttf
│   ├── montserrat-500.ttf
│   ├── montserrat-600.ttf
│   ├── montserrat-700.ttf
│   ├── montserrat-800.ttf
│   └── montserrat-900.ttf
└── nunito-sans/
    ├── nunito-sans-400.ttf
    ├── nunito-sans-500.ttf
    ├── nunito-sans-600.ttf
    └── nunito-sans-700.ttf
```

### Step 3: Rename Font Files

**Important**: Rename the downloaded TTF files to match the expected names:

- `Inter-Regular.ttf` → `inter-400.ttf`
- `Inter-Medium.ttf` → `inter-500.ttf`
- `Inter-SemiBold.ttf` → `inter-600.ttf`
- `Inter-Bold.ttf` → `inter-700.ttf`
- (And so on for other fonts)

## 🧪 Testing

### Step 1: Check Console Logs

When you generate a PDF, look for these logs in your browser console:

```
✅ 🔤 Initializing custom fonts...
✅ 🔤 Registered fonts: ['Inter', 'CrimsonText', 'JetBrainsMono', ...]
✅ 🔤 Font mapping: "'Crimson Text', 'Times New Roman', serif" → "CrimsonText"
```

### Step 2: Visual Comparison

1. **Web Preview**: Go to resume builder, select "Executive Classic"
2. **PDF Download**: Generate PDF of the same template
3. **Compare**: The fonts should now match exactly!

## 🔧 Troubleshooting

### Fonts Not Loading
- Check file paths are correct
- Ensure TTF files are in the right directories
- Restart development server
- Check browser console for errors

### Fonts Still Falling Back to Arial
- Verify font file names match expected pattern
- Check console logs for font loading errors
- Make sure fonts are accessible at `/fonts/` URLs

### CORS Errors
- Ensure font files are in `public/fonts/` (not `src/fonts/`)
- Check Next.js is serving static files correctly

## 🎯 Expected Results

**Before**: All PDFs use Arial/Times/Courier fonts
**After**: 
- Executive Classic → Crimson Text serif
- Modern Professional → Inter sans-serif  
- Tech Stack → JetBrains Mono monospace
- Creative Designer → Poppins sans-serif
- Artistic Portfolio → Playfair Display serif

## 📝 Notes

- Font files increase bundle size (~500KB per font family)
- Only TTF format is supported for PDF generation
- Web preview will still use Google Fonts (faster loading)
- PDF generation uses embedded fonts (perfect matching)