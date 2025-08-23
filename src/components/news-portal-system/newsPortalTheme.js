export const newsPortalTheme = {
  redGradient: 'linear-gradient(270deg, #DC143C 0%, #B22222 100%)',
  redGradientHover: 'linear-gradient(270deg, #B22222 0%, #8B0000 100%)',
  redPrimary: '#DC143C',
  redSecondary: '#B22222'
};

export const getRedButtonStyle = (variant = 'contained') => {
  if (variant === 'contained') {
    return {
      background: newsPortalTheme.redGradient,
      color: 'white',
      '&:hover': {
        background: newsPortalTheme.redGradientHover,
        boxShadow: '0 4px 8px rgba(220, 20, 60, 0.3)'
      },
      '&:disabled': {
        background: 'rgba(220, 20, 60, 0.3)',
        color: 'rgba(255, 255, 255, 0.5)'
      }
    };
  } else if (variant === 'outlined') {
    return {
      borderColor: newsPortalTheme.redPrimary,
      color: newsPortalTheme.redPrimary,
      '&:hover': {
        borderColor: newsPortalTheme.redSecondary,
        backgroundColor: 'rgba(220, 20, 60, 0.04)',
        color: newsPortalTheme.redSecondary
      }
    };
  }
  return {};
};