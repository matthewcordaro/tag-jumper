# Copilot Instructions for tag-jumper

## Overview

This project is a VS Code extension for quickly jumping between tags and attributes in HTML, HTX, JSX, and TSX files. The codebase is TypeScript-based and uses modern VS Code extension development practices.

## Key Architecture

- **Extension Entrypoint:** `src/extension.ts`
- **Core Logic:**
  - `src/babel-boundary-locator.ts`: Implements tag and attribute boundary detection using Babel AST
- **Testing:**
  - Tests are in `src/test/extension.test.ts` and use Mocha/BDD style (`describe`, `it`).
  - Test runner entry: `src/test/runTest.ts` launches the VS Code extension test host and loads the suite.
  - Test suite loader: `src/test/suite/index.ts` loads all `*.test.js` files using Mocha and `glob`.

## Keyboard Shortcuts & Navigation

- **Move Forward/Backward Element Tags:** `Ctrl+Super+Alt+Down` / `Ctrl+Super+Alt+Up`
- **Move Forward/Backward Through Element Attributes:** `Ctrl+Super+Alt+Right` / `Ctrl+Super+Alt+Left`
- These shortcuts allow users to quickly jump between tags and attributes in supported files.
- **Attribute navigation can optionally include tag boundaries** (see settings below).

## Settings

- **`tag-jumper.includeTagPositionsInAttributeNavigation`** (boolean, default: `true`)
  - If enabled, attribute navigation will also include tag navigation positions. This allows attribute navigation to jump to both attribute and tag boundaries.
  - Can be configured in VS Code settings UI or `settings.json`.

## Developer Workflows

- **Build:**
  - `npm run compile` (type-check, lint, bundle with esbuild)
  - `npm run compile-tests` (compile tests to `out/`)
- **Lint:** `npm run lint`
- **Test:** `npm test` (runs extension tests in VS Code host)
- **Watch:** `npm run watch` (parallel watch for esbuild and tsc)

## Testing Details

- Do **not** run test files directly; always use the test runner (`runTest.ts`).
- All test files must only contain test definitions, not test runner logic.
- The test runner expects compiled test files in `out/test/`.
- The test suite loader (`suite/index.ts`) uses `glob` to find all `*.test.js` files.

## Project Conventions

- **Imports:** Use relative imports for internal modules (e.g., `import ... from "../babel-boundary-locator"`).
- **TypeScript:** `skipLibCheck` is recommended in `tsconfig.json` to avoid third-party type errors (e.g., from `lru-cache`).
- **No direct Node.js test execution:** Always use the VS Code extension test host for running tests.

## External Dependencies

- `@vscode/test-electron` for running extension tests
- `esbuild` for bundling
- `lru-cache` (used internally or by dependencies)
- `@babel/parser`, `@babel/traverse` for AST parsing

## Example: Adding a New Test

1. Add a new `*.test.ts` file in `src/test/`.
2. Only include test definitions (`suite`, `test`).
3. Run `npm run compile-tests` to compile.
4. Run `npm test` to execute in the VS Code extension host.

## Key Files

- `src/babel-boundary-locator.ts`: Tag and attribute boundary logic
- `src/extension.ts`: Extension entrypoint and command registration
- `src/test/extension.test.ts`: Main test suite
- `src/test/runTest.ts`: Test runner entry
- `src/test/suite/index.ts`: Mocha suite loader
- `package.json`: Scripts and dependencies

---

If any section is unclear or missing important project-specific details, please provide feedback to improve these instructions.
