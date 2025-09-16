// Report Management System Dark Theme Configuration
const RMSTheme = {
  // Primary color palette - Dark theme
  primary: {
    main: '#2C3E50',        // Dark blue-gray
    light: '#34495E',       // Medium blue-gray
    dark: '#1A252F',        // Very dark blue-gray
    contrastText: '#FFFFFF' // White text
  },
  
  // Secondary color palette - Dark complementary
  secondary: {
    main: '#34495E',        // Medium blue-gray
    light: '#5D6D7E',       // Light blue-gray
    dark: '#212F3D',        // Dark blue-gray
    contrastText: '#FFFFFF'
  },
  
  // Gradient configurations - Dark gradients
  gradients: {
    primary: 'linear-gradient(270deg, #2C3E50 0%, #34495E 50%, #1A252F 100%)',
    secondary: 'linear-gradient(135deg, #34495E 0%, #2C3E50 50%, #212F3D 100%)',
    accent: 'linear-gradient(135deg, #5D6D7E 0%, #34495E 50%, #2C3E50 100%)',
    navbar: 'linear-gradient(270deg, #2C3E50 0%, #34495E 50%, #1A252F 100%)',
    card: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
    button: 'linear-gradient(135deg, #34495E 0%, #2C3E50 100%)',
    glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)'
  },
  
  // Status colors - Dark theme variants
  status: {
    success: '#27AE60',
    warning: '#F39C12',
    error: '#E74C3C',
    info: '#3498DB'
  },
  
  // Background colors - Dark theme
  background: {
    default: 'linear-gradient(135deg, #1A252F 0%, #2C3E50 100%)',
    paper: 'rgba(255, 255, 255, 0.05)',
    hover: 'rgba(255, 255, 255, 0.1)',
    selected: 'rgba(255, 255, 255, 0.15)',
    overlay: 'rgba(0, 0, 0, 0.5)'
  },
  
  // Text colors - High contrast for dark theme
  text: {
    primary: '#000000',        // Changed from #000000 to white
    secondary: '#B0BEC5',      // Changed from #000000 to light gray
    disabled: '#78909C',       // Changed from #000000 to medium gray
    hint: '#90A4AE',          // Changed from #000000 to hint gray
    onPrimary: '#FFFFFF',      // Changed from #000000 to white
    onDark: '#FFFFFF'          // Changed from #000000 to white
  },
  
  // Component-specific styles
  components: {
    navbar: {
      background: 'linear-gradient(270deg, #2C3E50 0%, #34495E 50%, #1A252F 100%)',
      text: '#FFFFFF',
      hoverBackground: 'rgba(255, 255, 255, 0.1)',
      activeIndicator: 'rgba(255, 255, 255, 0.15)',
      border: 'rgba(255, 255, 255, 0.2)',
      backdrop: 'blur(20px)'
    },
    
    card: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
      border: 'rgba(255, 255, 255, 0.1)',
      shadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      backdrop: 'blur(16px)'
    },
    
    button: {
      primary: {
        background: 'linear-gradient(135deg, #34495E 0%, #2C3E50 100%)',
        hover: 'linear-gradient(135deg, #5D6D7E 0%, #34495E 100%)',
        text: '#FFFFFF',
        border: 'rgba(255, 255, 255, 0.2)',
        shadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
      },
      secondary: {
        background: 'linear-gradient(135deg, #5D6D7E 0%, #34495E 100%)',
        hover: 'linear-gradient(135deg, #85929E 0%, #5D6D7E 100%)',
        text: '#FFFFFF',
        border: 'rgba(255, 255, 255, 0.2)',
        shadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
      },
      danger: {
        background: '#E74C3C',
        hover: '#C0392B',
        text: '#FFFFFF',
        border: 'rgba(255, 255, 255, 0.2)',
        shadow: '0 4px 16px rgba(231, 76, 60, 0.3)'
      },
      outlined: {
        border: 'rgba(255, 255, 255, 0.3)',
        text: '#FFFFFF',
        hover: 'rgba(255, 255, 255, 0.1)',
        background: 'rgba(255, 255, 255, 0.05)'
      }
    },
    
    form: {
      inputBorder: 'rgba(255, 255, 255, 0.2)',
      inputFocus: '#34495E',
      inputBackground: 'rgba(255, 255, 255, 0.05)',
      label: 'rgba(255, 255, 255, 0.8)',
      error: '#E74C3C',
      placeholder: 'rgba(255, 255, 255, 0.5)',
      backdrop: 'blur(10px)'
    },
    
    table: {
      header: 'linear-gradient(135deg, rgba(52, 73, 94, 0.3) 0%, rgba(44, 62, 80, 0.3) 100%)',
      border: 'rgba(255, 255, 255, 0.1)',
      hover: 'rgba(255, 255, 255, 0.05)',
      selected: 'rgba(52, 73, 94, 0.2)',
      background: 'rgba(255, 255, 255, 0.02)'
    },
    
    chip: {
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
      text: '#FFFFFF',
      border: 'rgba(255, 255, 255, 0.2)'
    }
  },
  
  // Spacing
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  },
  
  // Border radius
  borderRadius: {
    small: '8px',
    medium: '12px',
    large: '20px',
    round: '50%'
  },
  
  // Shadows - Enhanced for dark theme
  shadows: {
    light: '0 4px 16px rgba(0, 0, 0, 0.2)',
    medium: '0 8px 24px rgba(0, 0, 0, 0.3)',
    heavy: '0 12px 40px rgba(0, 0, 0, 0.4)',
    glow: '0 0 30px rgba(52, 73, 94, 0.5)',
    colorful: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)'
  },
  
  // Glass morphism effects
  glass: {
    backdrop: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(255, 255, 255, 0.05)',
    shadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    borderRadius: '16px'
  }
};

export default RMSTheme;