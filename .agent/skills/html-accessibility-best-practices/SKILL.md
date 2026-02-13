---
name: HTML Best Practices and Accessibility
description: Guidelines for writing Living Standard compliant HTML, correct WAI-ARIA usage, and ensuring accessibility validation using Markuplint.
---

# HTML & Accessibility Best Practices Skill

This skill outlines the standards for writing semantic, accessible, and robust HTML, referencing the HTML Living Standard and WAI-ARIA guidelines.

## 1. Living Standard HTML (Semantic Web)

Use native HTML elements whenever possible. They provide built-in accessibility features, keyboard navigation, and SEO benefits that generic `<div>` or `<span>` elements lack.

### Core Structure Elements
| Element | Purpose | Wrong Usage |
| :--- | :--- | :--- |
| `<main>` | The dominant content of the `<body>`. Use once per page. | `<div id="main">` |
| `<nav>` | Major navigation blocks. | `<div class="nav">` |
| `<article>` | Self-contained composition (e.g., blog post, comment). | `<section>` for generic containers |
| `<section>` | Thematic grouping of content, usually with a heading. | `<div class="section">` |
| `<aside>` | Content indirectly related to the main content (sidebar). | `<div class="sidebar">` |
| `<header>` | Introductory content or navigational aids. | `<div class="header">` |
| `<footer>` | Footer for its nearest sectioning content. | `<div class="footer">` |

### Text & Interactive Elements
- Use `<button>` for actions, `<a>` for navigation.
- Use `<h1>` through `<h6>` for hierarchical structure. Do not skip levels (e.g., `<h1>` to `<h3>`).
- Use `<ul>`/`<ol>` for lists, not `<div>`s with breaks.

## 2. WAI-ARIA Best Practices

**First Rule of ARIA:** Do not use ARIA to change the semantics of a valid HTML element if the element already handles the behavior.

### ✅ Correct Usage
- **`aria-label`**: Use when a visible label is not present (e.g., icon-only buttons).
  ```html
  <button aria-label="Close menu"><Icon name="close" /></button>
  ```
- **`aria-expanded`**: For collapsible components (accordions, menus).
- **`aria-current`**: To indicate the current item within a set (e.g., current page in pagination or navigation).
  ```html
  <a href="/about" aria-current="page">About</a>
  ```
- **`aria-live`**: For dynamic content updates (toasts, status messages).
  ```html
  <div role="status" aria-live="polite">Settings saved.</div>
  ```

### ❌ Common Mistakes
- **Redundant Roles**: `<button role="button">` (Unnecessary).
- **Misusing Roles**: `<div onClick={...} role="button">` (Missing keyboard support `onKeyDown`/`tabIndex`). Use `<button>` instead.
- **Placeholder as Label**: Do not use `placeholder` as a replacement for `<label>`.

## 3. Form Optimization

### Autocomplete Attributes
Always use `autocomplete` attributes on personal data inputs to enable browser autofill.

```html
<label for="email">Email</label>
<input id="email" type="email" autocomplete="email" />

<label for="cc-number">Card Number</label>
<input id="cc-number" type="text" autocomplete="cc-number" />
```

### Explicit Labeling
Connect labels to inputs:
```html
<!-- Option A: "for" attribute -->
<label for="username">Username</label>
<input id="username" ... />

<!-- Option B: Wrapping (Implicit) -->
<label>
  Username
  <input type="text" ... />
</label>
```

## 4. Validation with Markuplint

Use **Markuplint** to automatically enforce these standards.

### Installation
```bash
npm install -D markuplint @markuplint/jsx-parser @markuplint/ruler
```

### Configuration (`.markuplintrc`)
Recommended configuration for accessibility and standard compliance:

```json
{
  "parser": {
    ".tsx$": "@markuplint/jsx-parser",
    ".jsx$": "@markuplint/jsx-parser"
  },
  "extends": [
    "markuplint:recommended",
    "markuplint:html-standard",
    "markuplint:a11y"
  ],
  "rules": {
    "wai-aria": true,
    "label-has-control": true,
    "id-duplication": true,
    "invalid-attr": true,
    "landmark-roles": true
  }
}
```

### Running Checks
Add a script to `package.json`:
```json
"scripts": {
  "lint:html": "markuplint 'src/**/*.{jsx,tsx,html}'"
}
```
