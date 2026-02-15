# Separation Patterns

## Table of Contents
- [Feature-based Colocation Structure](#feature-based-colocation-structure)
- [Route/Page Files](#routepage-files)
- [Server/API Files](#serverapi-files)
- [Form Components](#form-components)
- [Framework-specific Examples](#framework-specific-examples)

## Feature-based Colocation Structure

Organize each feature as a self-contained directory:

```
features/items/
├── types.ts          # Data types & interfaces
├── handlers.ts       # Server functions / API handlers
├── ItemList.tsx      # List UI component
├── ItemDetail.tsx    # Detail UI component
├── ItemForm.tsx      # Form UI component
├── hooks.ts          # Custom hooks / reactive logic
└── utils.ts          # Feature-specific utilities
```

### Naming Convention

| File | Purpose | Naming |
|------|---------|--------|
| `types.ts` | Type definitions, interfaces, schemas | Always `types.ts` |
| `handlers.ts` | Server functions, API calls, mutations | Always `handlers.ts` |
| `hooks.ts` | Reactive state, derived data, side effects | Always `hooks.ts` (or `signals.ts` for Solid) |
| `utils.ts` | Pure utility functions, transformations | Always `utils.ts` |
| `*.tsx` | UI components | PascalCase matching component name |

## Route/Page Files

### Before (Mixed Concerns)

```tsx
// routes/items/[id]/index.tsx - BAD: 180+ lines, mixed concerns
import { createAsync } from "@solidjs/router";

export default function ItemDetail() {
  // Data fetching
  const item = createAsync(() => getItem(params.id));
  const allCategories = createAsync(() => getCategories());
  const allBoxes = createAsync(() => getBoxes());
  const itemCategories = createAsync(() => getItemCategories(params.id));
  const itemBoxes = createAsync(() => getItemBoxes(params.id));

  // Business logic
  const availableCategories = () => {
    const assigned = new Set((itemCategories() ?? []).map((c) => c.categoryId));
    return (allCategories() ?? []).filter((c) => !assigned.has(c.id));
  };

  const availableBoxes = () => {
    const assigned = new Set((itemBoxes() ?? []).map((b) => b.boxId));
    return (allBoxes() ?? []).filter((b) => !assigned.has(b.id));
  };

  // 100+ lines of JSX rendering...
  return <div>...</div>;
}
```

### After (Separated)

```ts
// features/items/types.ts
export interface Item {
  id: string;
  name: string;
  description: string;
}

export interface ItemRelations {
  categories: Category[];
  boxes: Box[];
  availableCategories: Category[];
  availableBoxes: Box[];
}
```

```ts
// features/items/hooks.ts
import type { Item, ItemRelations } from "./types";

export function useItemDetail(id: () => string) {
  const item = createAsync(() => getItem(id()));
  const allCategories = createAsync(() => getCategories());
  const allBoxes = createAsync(() => getBoxes());
  const itemCategories = createAsync(() => getItemCategories(id()));
  const itemBoxes = createAsync(() => getItemBoxes(id()));

  const availableCategories = () => {
    const assigned = new Set((itemCategories() ?? []).map((c) => c.categoryId));
    return (allCategories() ?? []).filter((c) => !assigned.has(c.id));
  };

  const availableBoxes = () => {
    const assigned = new Set((itemBoxes() ?? []).map((b) => b.boxId));
    return (allBoxes() ?? []).filter((b) => !assigned.has(b.id));
  };

  return { item, availableCategories, availableBoxes, itemCategories, itemBoxes };
}
```

```tsx
// routes/items/[id]/index.tsx - GOOD: thin route, UI only
import { useItemDetail } from "~/features/items/hooks";
import { ItemDetailView } from "~/features/items/ItemDetailView";

export default function ItemDetailPage() {
  const params = useParams();
  const data = useItemDetail(() => params.id);
  return <ItemDetailView {...data} />;
}
```

## Server/API Files

### Before (Mixed Concerns)

```ts
// api/item/server.ts - BAD: auth + validation + db + transform
export async function createItem(formData: FormData) {
  const user = await getUser();                          // auth
  const notion = await getUserNotionClient(user.id);     // client setup
  const config = await getUserConfig();                  // config
  if (!config?.notionDbId) throw redirect("/dashboard"); // guard

  const name = String(formData.get("name"));             // validation
  const description = String(formData.get("description") ?? "");

  await notion.pages.create({                            // db operation
    parent: { database_id: config.notionDbId },
    properties: { /* mapping */ }
  });
  throw redirect("/items");                              // navigation
}
```

### After (Separated)

```ts
// features/items/types.ts
export interface CreateItemInput {
  name: string;
  description: string;
  imageUrl?: string;
}

export function parseItemForm(formData: FormData): CreateItemInput {
  return {
    name: String(formData.get("name")),
    description: String(formData.get("description") ?? ""),
    imageUrl: formData.get("imageUrl") as string | undefined,
  };
}
```

```ts
// features/items/handlers.ts - focused on orchestration
import { parseItemForm } from "./types";

export async function createItem(formData: FormData) {
  const { notion, config } = await getAuthenticatedClient();
  const input = parseItemForm(formData);
  await notion.pages.create({
    parent: { database_id: config.notionDbId },
    properties: mapItemToNotion(input),
  });
  throw redirect("/items");
}
```

## Form Components

### Before (Mixed)

```tsx
// components/item/ItemForm.tsx - BAD: WASM logic + form UI
const handleFileChange = async (event: Event) => {
  const file = input.files[0];
  const photon = await import("@silvia-odwyer/photon");
  const buffer = await file.arrayBuffer();
  // ... 30 lines of image processing
};

return <form>...</form>;
```

### After (Separated)

```ts
// features/items/utils.ts - image processing logic
export async function compressImage(file: File): Promise<string> {
  const photon = await import("@silvia-odwyer/photon");
  const buffer = await file.arrayBuffer();
  // ... processing logic
  return base64Result;
}
```

```tsx
// features/items/ItemForm.tsx - UI only
import { compressImage } from "./utils";

const handleFileChange = async (event: Event) => {
  const file = input.files[0];
  const result = await compressImage(file);
  setImageData(result);
};

return <form>...</form>;
```

## Framework-specific Examples

### Solid.js / Solid Start

- Extract reactive computations into custom hooks (`createSignal`, `createMemo`, `createEffect`)
- Use `createAsync` in hooks, not in page components
- Server functions (`"use server"`) go in `handlers.ts`

### React / Next.js

- Extract `useState`/`useEffect`/`useMemo` into custom hooks
- Server Components keep data fetching; Client Components handle interactivity
- Server Actions go in `actions.ts`

### Vue / Nuxt

- Extract `ref`/`computed`/`watch` into composables
- `useFetch`/`useAsyncData` go in composables
- Server routes go in `server/api/`

### Svelte / SvelteKit

- Extract reactive stores into separate `.ts` files
- `load` functions stay in `+page.server.ts` (already separated by convention)
- Shared logic goes in `lib/` modules
