// Centralized color theme for the application (Vibrant Variation)
export const colors = {
    // Primary colors (bolder, more saturated)
    primary: '#00CCFF',
    primaryLight: '#00E6FF',
    primaryDark: '#0099B3',
    
    // Background colors (darker, richer)
    background: '#070A12',
    backgroundSecondary: '#141925',
    backgroundTertiary: 'rgba(7, 10, 18, 0.85)',
    
    // Text colors (crisper whites)
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.95)',
    textTertiary: 'rgba(255, 255, 255, 0.75)',
    textMuted: 'rgba(255, 255, 255, 0.55)',
    
    // Border colors (more vivid)
    borderPrimary: 'rgba(0, 204, 255, 0.3)',
    borderSecondary: 'rgba(0, 204, 255, 0.15)',
    borderTertiary: 'rgba(0, 204, 255, 0.4)',
    
    // Overlay and backdrop colors (stronger)
    overlayPrimary: 'rgba(0, 204, 255, 0.15)',
    overlaySecondary: 'rgba(0, 204, 255, 0.08)',
    overlayTertiary: 'rgba(0, 204, 255, 0.05)',
    overlayHover: 'rgba(0, 204, 255, 0.2)',
    
    // Gradient colors (bolder transitions)
    gradientPrimary: 'linear-gradient(135deg, #070A12 0%, #141925 100%)',
    gradientSecondary: 'linear-gradient(180deg, rgba(0, 204, 255, 0.15) 0%, rgba(0, 204, 255, 0) 100%)',
    gradientTertiary: 'linear-gradient(90deg, rgba(0, 204, 255, 0.15) 0%, rgba(0, 204, 255, 0.08) 100%)',
    gradientBorder: 'linear-gradient(90deg, #00CCFF 0%, rgba(0, 204, 255, 0.15) 100%)',
    gradientBorderHover: 'linear-gradient(90deg, #00CCFF 0%, #00E6FF 50%, rgba(0, 204, 255, 0.15) 100%)',
    gradientVertical: 'linear-gradient(180deg, #00CCFF 0%, rgba(0, 204, 255, 0.15) 100%)',
    
    // Shadow colors (more pronounced)
    shadowPrimary: 'rgba(0, 204, 255, 0.15)',
    shadowSecondary: 'rgba(0, 204, 255, 0.25)',
    shadowTertiary: 'rgba(0, 204, 255, 0.2)',
    
    // Radial gradient colors
    radialPrimary: 'radial-gradient(circle, rgba(0, 204, 255, 0.08) 0%, transparent 70%)',
    
    // Error colors (bolder red)
    error: '#FF4D4D',
    errorBackground: 'rgba(255, 77, 77, 0.15)',
    
    // Success colors (bolder green)
    success: '#43A047',
    successBackground: 'rgba(67, 160, 71, 0.15)',
    
    // Warning colors (bolder orange)
    warning: '#FB8C00',
    warningBackground: 'rgba(251, 140, 0, 0.15)',
    
    // Chart colors (vibrant shades)
    chartColors: {
      primary: '#00CCFF',
      secondary: '#00E6FF',
      tertiary: '#0099B3',
      quaternary: '#007A99',
      quinary: '#005B80',
      senary: '#003C66',
      septenary: '#001D4D',
      octonary: '#000F33',
    },
    
    // Performance colors (bolder tones)
    performance: {
      excellent: '#43A047',
      good: '#7CB342',
      average: '#FFB300',
      poor: '#FB8C00',
      veryPoor: '#E53935',
    },
    
    // Status colors (bolder tones)
    status: {
      win: '#43A047',
      loss: '#E53935',
      draw: '#FB8C00',
      noContest: '#757575',
    }
  } as const;
  
  export type ColorTheme = typeof colors;