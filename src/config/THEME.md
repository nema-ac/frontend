# NEMA Theme Configuration

This document describes the centralized theme system for managing fonts, colors, and spacing across the NEMA application.

## Font Size Management

All font sizes are centralized in two places:

1. **CSS Variables** (`frontend/src/index.css`): CSS custom properties for use in stylesheets
2. **Theme Config** (`frontend/src/config/theme.js`): JavaScript object for programmatic access

### Font Size Scale

- `--font-size-xs` / `theme.fonts.xs`: **10px** - Extra small (chat messages, timestamps, captions)
- `--font-size-sm` / `theme.fonts.sm`: **12px** - Small (navigation links, buttons, secondary text)
- `--font-size-base` / `theme.fonts.base`: **14px** - Base body font size
- `--font-size-md` / `theme.fonts.md`: **16px** - Medium
- `--font-size-lg` / `theme.fonts.lg`: **18px** - Large
- `--font-size-xl` / `theme.fonts.xl`: **20px** - Extra large
- `--font-size-2xl` / `theme.fonts['2xl']`: **24px** - 2X large
- `--font-size-3xl` / `theme.fonts['3xl']`: **32px** - 3X large

### Display Fonts (IntraNet family)

- `--font-size-display-1` / `theme.fonts.display1`: **32px** - Largest display text
- `--font-size-display-2` / `theme.fonts.display2`: **20px** - Secondary display text
- `--font-size-header-2` / `theme.fonts.header2`: **12px** - Section headers
- `--font-size-header-3` / `theme.fonts.header3`: **10px** - Subsection headers
- `--font-size-caption-2` / `theme.fonts.caption2`: **10px** - Secondary captions
- `--font-size-caption-1` / `theme.fonts.caption1`: **8px** - Smallest captions

## Component-Specific Font Sizes

### Navigation
- Links: `text-sm` (12px)

### Chat Components
- Messages: `text-xs` (10px)
- Timestamps: `text-[10px]` (10px)
- Input fields: `text-xs` (10px)

### Buttons
- Small buttons: `text-xs` (10px)
- Medium buttons: `text-sm` (12px)

## How to Adjust Font Sizes

### Option 1: Update CSS Variables (Recommended)

Edit `frontend/src/index.css` and update the CSS custom properties:

```css
@theme {
  --font-size-base: 14px;  /* Change this to adjust base size */
  --font-size-xs: 10px;    /* Change this to adjust extra small */
  --font-size-sm: 12px;    /* Change this to adjust small */
  /* ... etc */
}
```

All components using Tailwind classes like `text-xs`, `text-sm`, etc. will automatically scale.

### Option 2: Update Theme Config

Edit `frontend/src/config/theme.js`:

```javascript
export const theme = {
  fonts: {
    base: '14px',  // Change this
    xs: '10px',    // Change this
    sm: '12px',    // Change this
    // ... etc
  }
};
```

Then update the CSS variables in `index.css` to match.

## Usage Examples

### In CSS/Tailwind Classes

```jsx
// Use Tailwind size classes (they map to CSS variables)
<div className="text-xs">Small text</div>
<div className="text-sm">Slightly larger text</div>
<div className="text-base">Base size text</div>
```

### In JavaScript/React Components

```javascript
import theme from '../config/theme';

const fontSize = theme.fonts.sm; // "12px"
```

## Consistency Guidelines

1. **Navigation links**: Always use `text-sm` (12px)
2. **Chat messages**: Always use `text-xs` (10px)
3. **Timestamps**: Always use `text-[10px]` (10px)
4. **Body text**: Use `text-base` (14px) or inherit from parent
5. **Headings**: Use display utilities (`nema-display-1`, `nema-display-2`, etc.)

## Notes

- The base font size affects the entire application's scale
- Display fonts (IntraNet family) are separate from body fonts (Monaspace Neon)
- All font sizes use pixels (px) for consistency
- Tailwind's responsive prefixes (`lg:`, `xl:`) can be used for responsive sizing

