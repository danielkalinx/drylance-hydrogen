/**
 * Color conversion utilities for hex to OKLCH
 */

/**
 * Convert a hex color to RGB values
 */
function hexToRgb(hex: string): [number, number, number] {
  // Remove # if present
  hex = hex.replace('#', '');

  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  return [r, g, b];
}

/**
 * Convert RGB to linear RGB
 */
function rgbToLinearRgb(
  rgb: [number, number, number],
): [number, number, number] {
  return rgb.map((val) =>
    val <= 0.04045 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4),
  ) as [number, number, number];
}

/**
 * Convert linear RGB to OKLAB
 */
function linearRgbToOklab(
  rgb: [number, number, number],
): [number, number, number] {
  const [r, g, b] = rgb;

  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  return [L, a, b_];
}

/**
 * Convert OKLAB to OKLCH
 */
function oklabToOklch(lab: [number, number, number]): [number, number, number] {
  const [L, a, b] = lab;

  const C = Math.sqrt(a * a + b * b);
  let h = (Math.atan2(b, a) * 180) / Math.PI;

  // Normalize hue to 0-360
  if (h < 0) {
    h += 360;
  }

  return [L, C, h];
}

/**
 * Convert hex color to OKLCH
 * @param hex - Hex color string (with or without #)
 * @returns OKLCH values as [lightness, chroma, hue]
 */
export function hexToOklch(hex: string): [number, number, number] {
  const rgb = hexToRgb(hex);
  const linearRgb = rgbToLinearRgb(rgb);
  const oklab = linearRgbToOklab(linearRgb);
  const oklch = oklabToOklch(oklab);

  return oklch;
}

/**
 * Convert hex to OKLCH CSS string
 * @param hex - Hex color string (with or without #)
 * @returns CSS-formatted OKLCH string
 */
export function hexToOklchString(hex: string): string {
  const [l, c, h] = hexToOklch(hex);
  return `oklch(${(l * 100).toFixed(2)}% ${c.toFixed(3)} ${h.toFixed(1)})`;
}
