import fs from 'fs';
import path from 'path';
import {hexToOklchString, hslToOklchString} from '../app/utils/colorConverter';

// Regex to match CSS custom property with hex or HSL color (captures groups for name and value)
const CSS_VAR_COLOR_REGEX =
  /--([a-zA-Z0-9-]+):\s*((?:#[A-Fa-f0-9]{6}|#[A-Fa-f0-9]{3})|(?:hsl\(\s*\d+\s+\d+%?\s+\d+%?\s*\)))\s*;/g;

function expandShorthandHex(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');

  // If it's a shorthand (3 digits), expand it
  if (hex.length === 3) {
    return hex
      .split('')
      .map((char) => char + char)
      .join('');
  }
  return hex;
}

function convertFileColors(filePath: string) {
  try {
    // Read the file
    const content = fs.readFileSync(filePath, 'utf8');

    // Replace CSS custom properties with hex or HSL colors to OKLCH format
    const updatedContent = content.replace(
      CSS_VAR_COLOR_REGEX,
      (match, name, colorValue) => {
        const oklchColor = colorValue.startsWith('#')
          ? hexToOklchString(colorValue)
          : hslToOklchString(colorValue);
        return `--${name}: ${oklchColor};`;
      },
    );

    // Write back to file
    fs.writeFileSync(filePath, updatedContent);

    console.log(`Successfully converted colors in ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

// Get file path from command line argument
const filePath = process.argv[2];

if (!filePath) {
  console.error('Please provide a file path');
  process.exit(1);
}

const absolutePath = path.resolve(process.cwd(), filePath);

if (!fs.existsSync(absolutePath)) {
  console.error(`File not found: ${absolutePath}`);
  process.exit(1);
}

convertFileColors(absolutePath);
