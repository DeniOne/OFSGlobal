import { createTheme } from '@mui/material/styles';

// Определяем основные цвета
const primaryColor = '#9D6AF5';
const secondaryColor = '#ff00ff';
const backgroundColor = '#1a1a1a';
const surfaceColor = '#2a2a2a';
const textColor = '#ffffff';

// Создаем тему
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: primaryColor,
      light: '#80ffce',
      dark: '#00cc7d',
      contrastText: backgroundColor,
    },
    secondary: {
      main: secondaryColor,
      light: '#ff80ff',
      dark: '#cc00cc',
      contrastText: textColor,
    },
    background: {
      default: backgroundColor,
      paper: surfaceColor,
    },
    text: {
      primary: textColor,
      secondary: '#b3b3b3',
    },
  },
  typography: {
    fontFamily: '"Rajdhani", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '0.15em',
      textTransform: 'uppercase',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      letterSpacing: '0.1em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      letterSpacing: '0.08em',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      letterSpacing: '0.05em',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      letterSpacing: '0.04em',
    },
    button: {
      textTransform: 'uppercase',
      fontWeight: 600,
      letterSpacing: '0.1em',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: `${primaryColor} ${backgroundColor}`,
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: backgroundColor,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: primaryColor,
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: secondaryColor,
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          textTransform: 'uppercase',
          fontWeight: 600,
          letterSpacing: '0.1em',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: `0 0 10px ${primaryColor}`,
          },
        },
        contained: {
          background: `linear-gradient(45deg, ${primaryColor}, ${secondaryColor})`,
          '&:hover': {
            background: `linear-gradient(45deg, ${secondaryColor}, ${primaryColor})`,
          },
        },
        outlined: {
          borderColor: primaryColor,
          '&:hover': {
            borderColor: secondaryColor,
            boxShadow: `0 0 10px ${secondaryColor}`,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: surfaceColor,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: `linear-gradient(45deg, ${primaryColor}20, transparent)`,
            opacity: 0.1,
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: `linear-gradient(90deg, ${backgroundColor}, ${surfaceColor})`,
          boxShadow: `0 0 10px ${primaryColor}40`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: `linear-gradient(180deg, ${backgroundColor}, ${surfaceColor})`,
          borderRight: `1px solid ${primaryColor}40`,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            background: `linear-gradient(90deg, ${primaryColor}20, transparent)`,
            '&:hover': {
              background: `linear-gradient(90deg, ${primaryColor}30, transparent)`,
            },
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: `${primaryColor}40`,
            },
            '&:hover fieldset': {
              borderColor: primaryColor,
            },
            '&.Mui-focused fieldset': {
              borderColor: secondaryColor,
              boxShadow: `0 0 10px ${secondaryColor}40`,
            },
          },
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          background: `linear-gradient(45deg, ${primaryColor}, ${secondaryColor})`,
        },
      },
    },
  },
});

export default theme; 