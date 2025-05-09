const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Define the sizes and file paths
const sizes = [16, 48, 128];

async function convertSvgToPng() {
  try {
    for (const size of sizes) {
      const svgPath = path.join(__dirname, 'icons', `icon${size}.svg`);
      const pngPath = path.join(__dirname, 'icons', `icon${size}.png`);
      
      if (fs.existsSync(svgPath)) {
        console.log(`Converting ${svgPath} to PNG...`);
        await sharp(svgPath)
          .resize(size, size)
          .png()
          .toFile(pngPath);
        console.log(`Created ${pngPath}`);
      } else {
        console.error(`SVG file not found: ${svgPath}`);
      }
    }
    console.log('Conversion completed successfully!');
  } catch (err) {
    console.error('Error during conversion:', err);
  }
}

// Run the conversion
convertSvgToPng();
