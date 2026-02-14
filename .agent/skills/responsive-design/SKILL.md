---
name: Responsive Design with Panda CSS
description: Guidelines for implementing responsive design using Panda CSS, focusing on mobile-first approach and cohesive layout patterns.
---

# Responsive Design Skill (Panda CSS)

This skill outlines the best practices for implementing responsive design using Panda CSS in this project.

## 1. Core Concepts

### Mobile-First Approach
Always design and implement for mobile screens first (base styles), then add overrides for larger screens using breakpoints. This ensures usage of the minimum required CSS and better performance on constrained devices.

### Breakpoints
Panda CSS standard breakpoints (unless overridden in `panda.config.ts`):
- **base**: 0px - 640px (Default style, no prefix)
- **sm**: 640px (@media (min-width: 640px))
- **md**: 768px (@media (min-width: 768px))
- **lg**: 1024px (@media (min-width: 1024px))
- **xl**: 1280px (@media (min-width: 1280px))
- **2xl**: 1536px (@media (min-width: 1536px))

## 2. Implementation Patterns

### Object Syntax
Use the object syntax within `css()` or pattern functions for responsive styles. This keeps styles collocated and readable.

```typescript
// ✅ Good: Object syntax
import { css } from "styled-system/css";

const boxStyle = css({
  padding: "4",
  fontSize: "sm",
  // Responsive overrides
  md: {
    padding: "6",
    fontSize: "md",
  },
  lg: {
    padding: "8",
  }
});
```

### Conditional Rendering vs. CSS Hiding
- **CSS Hiding**: Use `hideBelow` / `hideFrom` patterns (or `display: none`) if the element is lightweight and necessary for SEO/accessibility but shouldn't be visible.
- **Conditional Rendering**: Use `Show` component with a media query hook (if available) for heavy components that shouldn't be in the DOM on certain devices.

### Utility Patterns

#### Stack / Flex Layouts
Change direction or alignment based on screen size.

```typescript
const stackStyle = css({
  display: "flex",
  flexDirection: "column", // Mobile: Vertical stack
  gap: "4",
  md: {
    flexDirection: "row", // Tablet+: Horizontal row
    alignItems: "center",
  }
});
```

#### Grid Layouts
Adjust column counts relative to breakpoints.

```typescript
const gridStyle = css({
  display: "grid",
  gridTemplateColumns: "1fr", // Mobile: 1 column
  gap: "4",
  sm: {
    gridTemplateColumns: "repeat(2, 1fr)", // Phablet: 2 columns
  },
  lg: {
    gridTemplateColumns: "repeat(4, 1fr)", // Desktop: 4 columns
  }
});
```

## 3. Common Pitfalls
- **Over-using specific pixel values**: Rely on theme tokens (sizes, spacing) rather than raw generic values to ensure consistency across breakpoints.
- **Desktop-first thinking**: Avoid writing desktop styles as the default and trying to "undo" them for mobile. It often leads to more complex CSS.
- **Ignoring intermediate states**: Check `sm` and `lg` breakpoints, not just `base` and `xl`, to ensure smooth transitions.
