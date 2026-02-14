---
name: WebAssembly (WASM) Performance Optimization
description: Guidelines for leveraging WebAssembly (WASM) to optimize CPU-intensive tasks and overcome JavaScript execution bottlenecks.
---

# WebAssembly (WASM) Performance Optimization Skill

This skill provides guidelines for identifying performance bottlenecks in JavaScript/TypeScript applications and resolving them by integrating WebAssembly (WASM) based libraries.

## 1. When to Use WASM

JavaScript is fast, but certain tasks can be CPU-bound or memory-intensive. Use WASM when you encounter:

*   **Complex Mathematical Calculations**: Matrix operations, physics simulations.
*   **Media Processing**: Image resizing/encoding, video transcoding, audio analysis.
*   **Cryptography**: Hashing (Argon2, bcrypt), encryption/decryption, large number arithmetic.
*   **Data Compression/Decompression**: Handling large datasets or custom compression formats (e.g., Zstandard, Brotli).
*   **Parsing/Compilation**: Large-scale text parsing, syntax highlighting, or language compilation in the browser.

## 2. Recommended WASM Libraries

Prefer well-maintained libraries that provide a friendly JavaScript/TypeScript binding over raw WASM modules.

### Cryptography & Security
*   **`hash-wasm`**: Highly optimized hashing algorithms (Argon2, scrypt, SHA variants). Use this over pure JS implementations for repetitive or heavy hashing.
*   **`bcrypt-wasm`**: Fast bcrypt implementation.

### Image & Media
*   **`@resvg/resvg-wasm`**: High-performance SVG to PNG rendering.
*   **`squoosh-lib` / `sharp` (via WASM)**: Image compression and manipulation.
*   **`ffmpeg.wasm`**: Video and audio processing in the browser.

### Data & Utilities
*   **`sql.js`**: SQLite compiled to WebAssembly. valuable for client-side databases or testing.
*   **`fzstd`**: Fast Zstandard compression/decompression.
*   **`yoga-wasm`**: Flexbox layout engine (useful for canvas/visualization layouts).

## 3. Implementation Best Practices

### Asynchronous Loading
WASM modules often require async initialization. Always handle loading states.

```typescript
import { argon2id } from "hash-wasm";

// WASM functions are typically async
const hash = await argon2id({
  password: "password",
  salt: salt,
  // ...options
});
```

### Bundle Size Considerations
WASM binaries can be large.
*   **Dynamic Import**: Use `import()` to load the WASM-dependent module only when needed.
*   **Vite/Webpack Configuration**: Ensure your bundler correctly handles `.wasm` files (often requires plugin or specific asset configuration).

### Environment Compatibility
*   **Browser vs. Node.js**: Ensure the chosen library supports your target environment. Some efficient WASM libraries are browser-optimized but work in Node.js/Bun/Deno.
*   **Fallback**: For critical features where WASM might fail (rare, but possible in strictly restricted environments), consider a pure JS fallback if feasible, but prioritize WASM for performance.

## 4. Example: Replacing Slow JS Crypto

**Before (Slow JS):**
```typescript
import { hash } from "slow-js-crypto-lib";
const result = hash(data); // Blocks main thread
```

**After (Fast WASM):**
```typescript
import { sha256 } from "hash-wasm";
const result = await sha256(data); // Runs efficiently, often off-main-thread or highly optimized
```
