/**
 * Centralized theme configuration for NEMA
 * All font sizes, spacing, and design tokens should be defined here
 * for easy adjustment and consistency across the app
 */

export const theme = {
  // Base font sizes (in pixels)
  fonts: {
    base: '14px',           // Base body font size
    xs: '10px',             // Extra small (captions, timestamps)
    sm: '12px',             // Small (navigation links, buttons)
    baseSize: '14px',       // Base text
    md: '16px',             // Medium
    lg: '18px',             // Large
    xl: '20px',             // Extra large
    '2xl': '24px',          // 2X large
    '3xl': '32px',          // 3X large
    
    // Display fonts (IntraNet family)
    display1: '32px',       // Largest display
    display2: '20px',       // Secondary display
    header2: '12px',        // Section headers
    header3: '10px',        // Subsection headers
    caption2: '10px',       // Secondary captions
    caption1: '8px',        // Smallest captions
  },

  // Spacing scale
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
  },

  // Component-specific sizes
  components: {
    navigation: {
      height: '3rem',        // 48px (h-12)
      logo: {
        desktop: '24px',
        mobile: '28px',
      },
      linkSize: 'sm',        // Use theme.fonts.sm (12px)
    },
    chat: {
      messageSize: 'xs',     // Use theme.fonts.xs (10px)
      timestampSize: 'xs',   // Use theme.fonts.xs (10px)
      inputSize: 'xs',       // Use theme.fonts.xs (10px)
    },
    buttons: {
      small: {
        padding: '0.375rem 0.75rem',  // px-3 py-1.5
        fontSize: 'xs',               // 10px
      },
      medium: {
        padding: '0.5rem 1rem',      // px-4 py-2
        fontSize: 'sm',               // 12px
      },
    },
  },
};

// Helper function to get font size
export const getFontSize = (key) => {
  return theme.fonts[key] || theme.fonts.base;
};

// Helper function to get component font size
export const getComponentFontSize = (component, element) => {
  const sizeKey = theme.components[component]?.[element];
  if (sizeKey) {
    return theme.fonts[sizeKey] || sizeKey;
  }
  return theme.fonts.base;
};

export default theme;

