/**
 * Color Helper Utilities
 * Shared color manipulation functions for VueFlow Canvas
 */

/**
 * Detect if a hex color is dark based on luminance calculation
 * @param {string} hexColor - Hex color string (e.g., "#ffffff" or "ffffff")
 * @returns {boolean} True if color is dark (luminance < 0.5)
 */
export const isDarkColor = (hexColor) => {
  if (!hexColor) return false;
  
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Handle short hex format (e.g., #fff -> #ffffff)
  const fullHex = hex.length === 3 
    ? hex.split('').map(char => char + char).join('')
    : hex;
  
  // Parse RGB values
  const r = parseInt(fullHex.substr(0, 2), 16);
  const g = parseInt(fullHex.substr(2, 2), 16);
  const b = parseInt(fullHex.substr(4, 2), 16);
  
  // Calculate relative luminance (perceived brightness)
  // Using ITU-R BT.709 coefficients
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Dark theme if luminance is below 0.5
  return luminance < 0.5;
};

/**
 * Convert hex color to RGB object
 * @param {string} hexColor - Hex color string
 * @returns {Object} { r, g, b } values 0-255
 */
export const hexToRgb = (hexColor) => {
  if (!hexColor) return { r: 0, g: 0, b: 0 };
  
  const hex = hexColor.replace('#', '');
  const fullHex = hex.length === 3 
    ? hex.split('').map(char => char + char).join('')
    : hex;
  
  return {
    r: parseInt(fullHex.substr(0, 2), 16),
    g: parseInt(fullHex.substr(2, 2), 16),
    b: parseInt(fullHex.substr(4, 2), 16),
  };
};

/**
 * Calculate luminance of a color
 * @param {string} hexColor - Hex color string
 * @returns {number} Luminance value 0-1
 */
export const getLuminance = (hexColor) => {
  const { r, g, b } = hexToRgb(hexColor);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};
