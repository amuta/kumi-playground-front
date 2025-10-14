# Design System

Minimal, modular styling architecture for Kumi Play.

## Architecture

- **Single source of truth**: `tailwind.config.js` for spacing tokens
- **No bloat**: Use Tailwind utilities directly, CVA for component variants
- **Keyboard-first**: `useKeyboard` hook for shortcuts

## Spacing Scale

```
xs:  0.5rem (8px)
sm:  0.75rem (12px)
md:  1rem (16px)
lg:  1.5rem (24px)
xl:  2rem (32px)
2xl: 3rem (48px)
3xl: 4rem (64px)
```

Usage: `gap-lg`, `px-md`, `py-xl`, etc.

## Components

- Use `focus-ring` utility class for consistent focus states
- Card components get `shadow-lg border-2` for depth
- Error states use `bg-destructive/10 border-destructive`

## Keyboard Shortcuts

- **Cmd/Ctrl + 1/2/3**: Switch between tabs (Schema/Compiled/Execute)
- **Cmd/Ctrl + S**: Compile schema

Add more via `useKeyboard` hook:
```tsx
useKeyboard({
  'meta+s': handleSave,
  'ctrl+k': openCommandPalette,
}, [deps]);
```
