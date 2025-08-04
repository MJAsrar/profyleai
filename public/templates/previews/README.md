# Template Preview Thumbnails

This directory contains thumbnail images for resume templates displayed in the template selector.

## Current Files (9 Templates Total)

- `modern-professional.jpg` - Modern Professional template preview (Inter font)
- `executive-classic.jpg` - Executive Classic template preview (Crimson Text font)
- `tech-stack.jpg` - Tech Stack template preview (JetBrains Mono font)
- `creative-designer.jpg` - Creative Designer template preview (Poppins font)
- `artistic-portfolio.jpg` - Artistic Portfolio template preview (Playfair Display font)
- `bold-modern.jpg` - Bold Modern template preview (Montserrat font)
- `clean-minimalist.jpg` - Clean Minimalist template preview (Nunito Sans, super dark green)
- `traditional-professional.jpg` - Traditional Professional template preview (Crimson Text)
- `ats-friendly.jpg` - ATS Friendly template preview

## Image Specifications

- **Dimensions**: 300x400px (3:4 aspect ratio)
- **Format**: JPG or PNG
- **Size**: Keep under 100KB for fast loading
- **Content**: Should show actual template layout with sample resume data

## Creating Custom Thumbnails

### Method 1: Screenshot Approach
1. Open the resume builder in your browser
2. Select the template you want to thumbnail
3. Fill with sample professional data
4. Take a screenshot of the preview
5. Crop to 300x400px
6. Optimize for web (compress to ~50-100KB)
7. Replace the corresponding file

### Method 2: Design Tool Approach
1. Use Figma, Photoshop, or similar tool
2. Create 300x400px canvas
3. Design a mockup showing the template's key features:
   - Header layout and typography
   - Section organization
   - Color scheme
   - Font choices
   - Overall aesthetic
4. Export as JPG/PNG
5. Replace the corresponding file

## Template-Specific Notes

### Modern Professional (Inter)
- Show Inter font
- Clean modern styling
- Professional blue color scheme

### Executive Classic (Crimson Text)
- Show Crimson Text serif font
- Black and white conservative design
- Traditional executive layout
- Formal typography

### Tech Stack (JetBrains Mono)
- Show technical/developer focus
- JetBrains Mono monospace font
- Tech-oriented content hints
- Code-friendly design

### Creative Designer (Poppins)
- Show Poppins sans-serif font
- Bold, artistic design elements
- Creative color schemes
- Designer-focused layout

### Artistic Portfolio (Playfair Display)
- Show Playfair Display elegant serif font
- Artistic, sophisticated design
- Creative professional aesthetic
- Portfolio-style layout

### Bold Modern (Montserrat)
- Show Montserrat font
- Bold, striking design
- Modern geometric styling
- Strong visual hierarchy

### Clean Minimalist (Nunito Sans)
- Ensure super dark green color (`#022c22`) is visible
- Show left border accents
- Nunito Sans font if possible
- Minimal, clean design

### Traditional Professional (Crimson Text)
- Show Crimson Text serif font
- Black and white conservative design
- Formal layout structure
- Traditional business format

### ATS Friendly
- Emphasize simple, clean layout
- No fancy formatting
- Clear section hierarchy
- System-parseable design

## File Naming Convention

Template thumbnails should match the slugified template name:
- Template: "Clean Minimalist" → File: `clean-minimalist.jpg`
- Template: "Modern Professional" → File: `modern-professional.jpg`

## Fallback Behavior

If a thumbnail fails to load, the template selector will automatically fall back to:
`/placeholder.svg?height=400&width=300`