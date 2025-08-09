# Tag Jumper VS Code Extension

[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/matthew-cordaro.tag-jumper?label=VS%20Code%20Marketplace)](https://marketplace.visualstudio.com/items?itemName=matthew-cordaro.tag-jumper)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/matthewcordaro/tag-jumper)

Tag Jumper is a [Visual Studio Code](https://code.visualstudio.com/) extension for quickly jumping between tags and attributes in HTML, HTX, JSX, and TSX files. It is designed for fast navigation in markup-heavy codebases, supporting both tag and attribute navigation with user-configurable behavior.

---

## Features

- **Jump between element tags** (open/self-closing) and attributes in supported files.
- **Commands:**
  - `Tag Jumper: Jump Forward Through Element Tags` (`tag-jumper.jumpForwardTag`)
  - `Tag Jumper: Jump Backward Through Element Tags` (`tag-jumper.jumpBackwardTag`)
  - `Tag Jumper: Jump Forward Through Element Attributes` (`tag-jumper.jumpForwardAttribute`)
  - `Tag Jumper: Jump Backward Through Element Attributes` (`tag-jumper.jumpBackwardAttribute`)
- **Keyboard Shortcuts:**
  - Jump Forward Through Element Tags: <kbd>Ctrl</kbd>+<kbd>Super</kbd>+<kbd>Alt</kbd>+<kbd>Down</kbd>
  - Jump Backward Through Element Tags: <kbd>Ctrl</kbd>+<kbd>Super</kbd>+<kbd>Alt</kbd>+<kbd>Up</kbd>
  - Jump Forward Through Element Attributes: <kbd>Ctrl</kbd>+<kbd>Super</kbd>+<kbd>Alt</kbd>+<kbd>Right</kbd>
  - Jump Backward Through Element Attributes: <kbd>Ctrl</kbd>+<kbd>Super</kbd>+<kbd>Alt</kbd>+<kbd>Left</kbd>
- **Configurable attribute navigation:**
  - By default, attribute navigation also includes tag boundaries (can be changed in settings).
- **Fast:** Uses a per-function, per-document-content cache for boundary positions.
- **Configurable activation languages:** Choose which languages Tag Jumper activates on (see settings).

---

## Settings

- `tag-jumper.includeTagPositionsInAttributeNavigation` (boolean, default: `true`)

  - If enabled, attribute navigation will also include tag navigation positions. This allows attribute navigation to jump to both attribute and tag boundaries.
  - Change this in VS Code settings UI or your `settings.json`.

- `tag-jumper.activationOnLanguage` (array of strings)
  - List of VS Code language IDs for which Tag Jumper is active. You can customize this to restrict or expand activation to specific languages. (Must be supported by Babel's parser.)
  - Defaults to: `["html", "xml", "javascript", "typescript", "javascriptreact", "typescriptreact", "jsx", "tsx", "htx"]`

---

## How It Works

- Tag and attribute boundaries are detected using Babel AST parsing.
- Navigation commands use a cache keyed by document content and boundary function for performance.
- The extension is written in TypeScript and follows modern VS Code extension best practices.

---

## Installation

Install via the [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=matthew-cordaro.tag-jumper) or search for "Tag Jumper" in the Extensions sidebar in VS Code.

---

## Development

- **Build:** `npm run compile`
- **Test:** `npm test`

---

## Feedback, Issues, and Contributions

This extension is maintained on [GitHub](https://github.com/matthewcordaro/tag-jumper).
Please use the repository for bug reports, feature requests, and contributions!

---

## Key Files

- `src/extension.ts` — Extension entrypoint and command registration
- `src/babel-boundary-locator.ts` — Tag and attribute boundary logic
- `src/test/extension.test.ts` — Main test suite

---

## License

This project is licensed under the [GNU General Public License v3.0](./LICENSE).
