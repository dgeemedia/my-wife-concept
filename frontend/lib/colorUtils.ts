// frontend/lib/colorUtils.ts

/**
 * Convert hex color to RGB string
 * @param hex - Hex color string (e.g., "#10B981" or "10B981")
 * @returns RGB string (e.g., "16, 185, 129")
 */
export function hexToRgb(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `${r}, ${g}, ${b}`;
}

/**
 * Apply theme colors to CSS variables
 * @param primaryColor - Primary color hex
 * @param secondaryColor - Secondary color hex
 */
export function applyThemeColors(primaryColor: string, secondaryColor: string): void {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  // Set color variables
  root.style.setProperty('--color-primary', primaryColor);
  root.style.setProperty('--color-secondary', secondaryColor);
  
  // Set RGB variables for opacity support
  root.style.setProperty('--color-primary-rgb', hexToRgb(primaryColor));
  root.style.setProperty('--color-secondary-rgb', hexToRgb(secondaryColor));
}

/**
 * Get current theme colors from CSS variables
 * @returns Object with primary and secondary colors
 */
export function getCurrentThemeColors(): { primary: string; secondary: string } {
  if (typeof document === 'undefined') {
    return { primary: '#10B981', secondary: '#F59E0B' };
  }
  
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);
  
  return {
    primary: computedStyle.getPropertyValue('--color-primary').trim() || '#10B981',
    secondary: computedStyle.getPropertyValue('--color-secondary').trim() || '#F59E0B',
  };
}