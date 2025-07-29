import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#800080', // Purple
      light: '#B347B3',
      dark: '#4B0082',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#1976d2', // Blue
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff',
    },
    accent: {
      main: '#FF6B35', // Orange
      light: '#FF8A65',
      dark: '#E64A19',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
      section: '#fafafa',
    },
    text: {
      primary: '#2c3e50',
      secondary: '#64748b',
      disabled: '#94a3b8',
    },
    divider: '#94a3b8',
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
    h4: {
      fontWeight: 'bold',
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #800080 0%, #4B0082 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #4B0082 0%, #800080 100%)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 8px 32px rgba(128, 0, 128, 0.15)',
          '&:hover': {
            boxShadow: '0 12px 48px rgba(128, 0, 128, 0.2)',
          },
          transition: 'box-shadow 0.3s ease-in-out',
        },
      },
    },
  },
});

export default theme;