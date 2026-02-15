# Code Separation Analysis Guide

## Table of Contents
- [Identifying Separation Boundaries](#identifying-separation-boundaries)
- [Concern Categories](#concern-categories)
- [Separation Decision Matrix](#separation-decision-matrix)
- [Refactoring Workflow](#refactoring-workflow)

## Identifying Separation Boundaries

Scan each file for these signals of mixed concerns:

### Signal 1: Multiple Import Domains

If a file imports from 3+ distinct domains, it likely mixes concerns:

```ts
// Signal: imports from UI, server, and utility domains
import { Button } from "~/components/ui/button";   // UI
import { createAsync } from "@solidjs/router";      // Data fetching
import { getUser } from "~/lib/auth";               // Auth
import { notion } from "~/lib/notion";              // Database
```

### Signal 2: Mixed Export Types

If a file exports both functions and JSX components, separate them:

```ts
// Signal: exports server functions AND UI components
export async function getItems() { ... }  // Server
export default function ItemList() { ... } // UI
```

### Signal 3: Long Files with Distinct Sections

Files over 100 lines with identifiable sections (data, logic, UI) should be split.

### Signal 4: Inline Transformations Before Render

Business logic computed inside component bodies:

```tsx
// Signal: derived data computed in component
function ItemPage() {
  const items = createAsync(() => getItems());
  // These belong in a hook or utils
  const filtered = () => items()?.filter(i => i.active);
  const sorted = () => filtered()?.sort((a, b) => a.name.localeCompare(b.name));
  return <div>...</div>;
}
```

## Concern Categories

Classify each block of code into one of these categories:

| Category | Description | Target File |
|----------|-------------|-------------|
| **Type** | Interfaces, type aliases, enums, schemas, parsing | `types.ts` |
| **Handler** | Server functions, API calls, mutations, CRUD | `handlers.ts` |
| **Hook** | Reactive state, derived data, subscriptions, effects | `hooks.ts` (or `signals.ts`) |
| **Component** | JSX/TSX rendering, event handlers tied to UI | `ComponentName.tsx` |
| **Utility** | Pure functions, transformations, helpers | `utils.ts` |

### Classification Rules

1. If it defines a shape of data → `types.ts`
2. If it talks to a server or database → `handlers.ts`
3. If it creates reactive state or derived computations → `hooks.ts`
4. If it returns JSX → `ComponentName.tsx`
5. If it's a pure function with no side effects → `utils.ts`
6. If it validates/parses input into a typed shape → `types.ts`

## Separation Decision Matrix

Not all files need separation. Use this matrix:

| Condition | Action |
|-----------|--------|
| File < 50 lines, single concern | Leave as-is |
| File < 100 lines, 2 concerns | Consider separating if concerns are unrelated |
| File > 100 lines, 2+ concerns | Separate |
| File has reusable logic | Always extract to shared module |
| File is a thin route wrapper | Leave as-is (routes should stay thin) |

## Refactoring Workflow

### Step 1: Analyze

Read the target file. Classify each block into a concern category. List the blocks with line ranges.

### Step 2: Plan

Determine target files for each block. Check if target files already exist. Plan import updates.

### Step 3: Extract

Move blocks to target files in dependency order:
1. `types.ts` first (no dependencies on other extracted files)
2. `utils.ts` next (depends only on types)
3. `handlers.ts` (depends on types, utils)
4. `hooks.ts` (depends on types, handlers)
5. Components last (depends on all above)

### Step 4: Wire

Update imports in the original file. Update imports in any files that imported from the original. Verify the original file is now a thin orchestrator.

### Step 5: Verify

Run type checker. Run tests. Confirm no circular dependencies.
