export const conditions = {
  extend: {
    light: '.light &, [data-theme="light"] &',
    dark: '.dark &, [data-theme="dark"] &',
    invalid: '&:is(:user-invalid, [data-invalid], [aria-invalid=true])',
    hover: '&:not(:disabled):hover',
    active: '&:not(:disabled):active',
    checked:
      '&:is(:checked, [data-checked], [data-state=checked], [aria-checked=true], [data-state=indeterminate])',
    on: '&:is([data-state=on])',
    pinned: '&:is([data-pinned])',
  },
} as const
