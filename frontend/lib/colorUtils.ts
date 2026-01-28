export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 16, g: 185, b: 129 }
}

export function darkenColor(r: number, g: number, b: number, amount: number): string {
  return `rgb(${Math.max(0, r - amount)}, ${Math.max(0, g - amount)}, ${Math.max(0, b - amount)})`
}

export function lightenColor(r: number, g: number, b: number, amount: number): string {
  return `rgb(${Math.min(255, r + amount)}, ${Math.min(255, g + amount)}, ${Math.min(255, b + amount)})`
}

export function applyThemeColors(primaryColor: string, secondaryColor: string) {
  if (typeof document === 'undefined') return

  try {
    document.documentElement.style.setProperty('--color-primary', primaryColor)
    document.documentElement.style.setProperty('--color-secondary', secondaryColor)
    
    const primaryRgb = hexToRgb(primaryColor)
    const secondaryRgb = hexToRgb(secondaryColor)
    
    document.documentElement.style.setProperty('--color-primary-rgb', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`)
    document.documentElement.style.setProperty('--color-secondary-rgb', `${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}`)
    
    // Set opacity variants (50 to 900)
    for (let i = 1; i <= 9; i++) {
      const opacity = i * 0.1
      document.documentElement.style.setProperty(
        `--color-primary-${i}00`, 
        `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, ${opacity.toFixed(2)})`
      )
    }
    
    document.documentElement.style.setProperty('--color-primary-hover', darkenColor(primaryRgb.r, primaryRgb.g, primaryRgb.b, 20))
    document.documentElement.style.setProperty('--color-primary-light', lightenColor(primaryRgb.r, primaryRgb.g, primaryRgb.b, 40))
  } catch (error) {
    console.warn('Could not apply theme colors:', error)
  }
}