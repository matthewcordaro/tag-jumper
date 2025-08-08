# Tag Jumper VS Code Extension

Tag Jumper is a VS Code extension for quickly jumping between tags and attributes in HTML, HTX, JSX, and TSX files. It is designed for fast navigation in markup-heavy codebases, supporting both tag and attribute navigation with user-configurable behavior.

## Features

- **Jump between element tags** (open/self-closing) and attributes in supported files.
- **Keyboard Shortcuts:**
  - Move Forward/Backward Element Tags: `Ctrl+Super+Alt+Down` / `Ctrl+Super+Alt+Up`
  - Move Forward/Backward Through Element Attributes: `Ctrl+Super+Alt+Right` / `Ctrl+Super+Alt+Left`
- **Configurable attribute navigation:**
  - By default, attribute navigation also includes tag boundaries (can be changed in settings).
- **Fast:** Uses a per-function, per-document-content cache for boundary positions.

## Settings

- `tag-jumper.includeTagPositionsInAttributeNavigation` (boolean, default: `true`)
  - If enabled, attribute navigation will also include tag navigation positions.
  - Change this in VS Code settings UI or your `settings.json`.

## How It Works

- Tag and attribute boundaries are detected using Babel AST parsing.
- Navigation commands use a cache keyed by document content and boundary function for performance.
- The extension is written in TypeScript and follows modern VS Code extension best practices.

## Development

- **Build:** `npm run compile`
- **Test:** `npm test`
- **Lint:** `npm run lint`
- **Watch:** `npm run watch`
- **Add tests:** Place new test files in `src/test/`, run `npm run compile-tests`, then `npm test`.

## Key Files

- `src/extension.ts` — Extension entrypoint and command registration
- `src/babel-boundary-locator.ts` — Tag and attribute boundary logic
- `src/test/extension.test.ts` — Main test suite

## Requirements

- Node.js >= 16
- VS Code >= 1.70

## License

MIT
