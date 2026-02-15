---
name: code-separator
description: >
  Separate web application code where types, handlers, hooks, and components
  are mixed into a single file. Uses scaffdog for generating new features with
  proper separation, and provides refactoring guidance for existing code.
  Use when (1) creating a new feature that needs types, handlers, hooks, and
  components, (2) a route/page file mixes data fetching, business logic, and
  UI rendering, (3) a server/API file mixes auth, validation, and database
  queries, (4) a component file embeds non-UI logic, (5) the user asks to
  split, separate, extract, or refactor code into multiple files.
  Solid Start + Park UI specialized.
---

# Code Separator

Generate properly separated feature code using scaffdog, or refactor existing mixed-concern files.

## New Feature Generation

Run scaffdog to generate a feature directory with separated files:

```bash
bunx scaffdog generate feature
```

This generates under `src/features/{name}/`:

| File | Concern |
|------|---------|
| `types.ts` | Interfaces, input types, form parsers |
| `handlers.ts` | Server functions (`"use server"`), CRUD, Notion API |
| `hooks.ts` | `createAsync`, `useSubmission`, derived state |
| `{Name}List.tsx` | Table list with delete dialog |
| `{Name}Form.tsx` | Create/edit form with Card layout |
| `{Name}Detail.tsx` | Detail view with edit link |

Route files should be thin wrappers importing from the feature directory:

```tsx
// routes/{feature}s/index.tsx
import { use{Feature}List } from "~/features/{feature}/hooks";
import { {Feature}List } from "~/features/{feature}/{Feature}List";

export default function {Feature}ListPage() {
  const { items } = use{Feature}List();
  return <{Feature}List items={items} />;
}
```

## Existing Code Refactoring

For files with mixed concerns, follow the extraction workflow.

### Concern Categories

| Category | Target File | Signal |
|----------|-------------|--------|
| Type | `types.ts` | `interface`, `type`, schemas, parsers |
| Handler | `handlers.ts` | `"use server"`, database calls, API requests |
| Hook | `hooks.ts` | `createAsync`, `createSignal`, `createMemo`, derived state |
| Component | `Name.tsx` | JSX rendering, UI-bound event handlers |
| Utility | `utils.ts` | Pure functions, data transformations |

### Extraction Order

1. `types.ts` (no internal dependencies)
2. `utils.ts` (depends on types only)
3. `handlers.ts` (depends on types, utils)
4. `hooks.ts` (depends on types, handlers)
5. Components (depends on all above)

### Decision Matrix

| Condition | Action |
|-----------|--------|
| File < 50 lines, single concern | Leave as-is |
| File > 100 lines, 2+ concerns | Separate |
| Reusable logic present | Always extract |

## References

- **Detailed before/after examples**: Read [references/patterns.md](references/patterns.md)
- **Analysis methodology**: Read [references/analysis-guide.md](references/analysis-guide.md)
