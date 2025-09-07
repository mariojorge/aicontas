const sharedConfig = {
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1600px',
  },
  
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem',  // 8px
    md: '1rem',    // 16px
    lg: '1.5rem',  // 24px
    xl: '2rem',    // 32px
    xxl: '3rem',   // 48px
    xxxl: '4rem',  // 64px
  },
  
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    overlay: 1040,
    modal: 1050,
  },
  
  transitions: {
    fast: '0.15s ease',
    normal: '0.2s ease',
    slow: '0.3s ease',
  },
};

export const lightTheme = {
  ...sharedConfig,
  colors: {
    primary: '#2563eb', // Blue-600
    primaryHover: '#1d4ed8', // Blue-700
    primaryLight: '#3b82f6', // Blue-500
    primaryDark: '#1d4ed8', // Blue-700
    secondary: '#1e40af', // Blue-800
    accent: '#60a5fa', // Blue-400
    
    success: '#10b981', // Green-500
    successLight: '#34d399', // Green-400
    error: '#ef4444', // Red-500
    errorLight: '#f87171', // Red-400
    warning: '#f59e0b', // Amber-500
    
    background: '#f8fafc', // Gray-50
    backgroundSecondary: '#ffffff', // White
    backgroundTertiary: '#f1f5f9', // Gray-100
    backgroundHover: '#f1f5f9', // Gray-100
    
    text: '#1e293b', // Gray-800
    textSecondary: '#64748b', // Gray-500
    textLight: '#94a3b8', // Gray-400
    
    border: '#e2e8f0', // Gray-200
    borderLight: '#f1f5f9', // Gray-100
    
    card: '#ffffff',
    cardBackground: '#ffffff',
    cardShadow: 'rgba(0, 0, 0, 0.1)',
    
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
};

export const darkTheme = {
  ...sharedConfig,
  colors: {
    primary: '#3b82f6', // Blue-500
    primaryHover: '#2563eb', // Blue-600
    primaryLight: '#60a5fa', // Blue-400
    primaryDark: '#1e40af', // Blue-800
    secondary: '#1e40af', // Blue-800
    accent: '#60a5fa', // Blue-400
    
    success: '#10b981', // Green-500
    successLight: '#34d399', // Green-400
    error: '#ef4444', // Red-500
    errorLight: '#f87171', // Red-400
    warning: '#f59e0b', // Amber-500
    
    background: '#0f172a', // Slate-900
    backgroundSecondary: '#1e293b', // Slate-800
    backgroundTertiary: '#334155', // Slate-700
    backgroundHover: '#334155', // Slate-700
    
    text: '#f1f5f9', // Slate-100
    textSecondary: '#cbd5e1', // Slate-300
    textLight: '#94a3b8', // Slate-400
    
    border: '#334155', // Slate-700
    borderLight: '#475569', // Slate-600
    
    card: '#1e293b', // Slate-800
    cardBackground: '#1e293b', // Slate-800
    cardShadow: 'rgba(0, 0, 0, 0.3)',
    
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
};

// Exportar como theme para manter compatibilidade
export const theme = lightTheme;