# Qué rompió el build en Railway (dist/main.js)

## Estado que funcionaba: `feature/rf-12-sync-import`

En esa rama `apps/api/tsconfig.json` tenía:

- **`"rootDir": "src"`** (activo)
- **`"include": ["src/**/*"]`** (solo código fuente)

Con eso, `npm run build` generaba **`dist/main.js`** y Railway con `node dist/main.js` funcionaba.

## Cambio que lo rompió: rama `feat/RF-02-user-management`

Commit **`d69a71ab`** — *"test: setup jest configurations and add user management test"*:

1. Se comentó **`rootDir`**: `// "rootDir": "src"`.
2. Se amplió **`include`** a: `["src/**/*", "tests/**/*", "prisma.config.ts"]`.

Motivo: poder compilar y type-chequear los tests con el mismo `tsconfig.json`.

Efecto: al compilar, TypeScript tomó como raíz la carpeta del proyecto (por no tener `rootDir`), así que la salida pasó a ser:

- **`dist/src/main.js`** en lugar de **`dist/main.js`**
- `dist/tests/...`, `dist/prisma.config.js`, etc.

El script de inicio sigue siendo **`node dist/main.js`**, así que en Railway apareció: **`Cannot find module '/app/dist/main.js'`**.

## Solución aplicada

Se restaura el comportamiento anterior:

- **`tsconfig.json`**: de nuevo `"rootDir": "src"` y `"include": ["src/**/*"]` (solo `src`).
- **Build**: usa solo `tsconfig.json` → se genera **`dist/main.js`**.
- **Typecheck**: usa **`tsconfig.test.json`** (que incluye `src` y `tests`) para seguir comprobando también los tests.
- **Jest**: ya usaba `tsconfig.test.json`; no hace falta cambiarlo.
- **`tsconfig.build.json`**: se elimina; el build vuelve a depender solo de `tsconfig.json`.

Así se recupera el build que funcionaba antes de RF-02, sin perder typecheck ni tests.
