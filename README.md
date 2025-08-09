# Tag Jumper VS Code Extension

[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/matthew-cordaro.tag-jumper?label=VS%20Code%20Marketplace)](https://marketplace.visualstudio.com/items?itemName=matthew-cordaro.tag-jumper)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-blue?logo=github)](https://github.com/matthewcordaro/tag-jumper)

Tag Jumper is a [Visual Studio Code](https://code.visualstudio.com/) extension for quickly jumping between tags and attributes in HTML, HTX, JSX, and TSX files. It is designed for fast navigation in markup-heavy codebases, supporting both tag and attribute navigation with user-configurable behavior.

---

## Features

- **Jump between element tags** (open/self-closing) and attributes in supported files.
- **Keyboard Shortcuts:**
  - Move Forward/Backward Element Tags: <kbd>Ctrl</kbd>+<kbd>Super</kbd>+<kbd>Alt</kbd>+<kbd>Down</kbd> / <kbd>Ctrl</kbd>+<kbd>Super</kbd>+<kbd>Alt</kbd>+<kbd>Up</kbd>
  - Move Forward/Backward Through Element Attributes: <kbd>Ctrl</kbd>+<kbd>Super</kbd>+<kbd>Alt</kbd>+<kbd>Right</kbd> / <kbd>Ctrl</kbd>+<kbd>Super</kbd>+<kbd>Alt</kbd>+<kbd>Left</kbd>
- **Configurable attribute navigation:**
  - By default, attribute navigation also includes tag boundaries (can be changed in settings).
- **Fast:** Uses a per-function, per-document-content cache for boundary positions.
- **Configurable activation languages:** Choose which languages Tag Jumper activates on (see settings).

---

## Settings

- `tag-jumper.includeTagPositionsInAttributeNavigation` (boolean, default: `true`)

  - If enabled, attribute navigation will also include tag navigation positions.
  - Change this in VS Code settings UI or your `settings.json`.

- `tag-jumper.activationOnLanguage` (array of strings)
  - List of VS Code language IDs for which Tag Jumper is enabled (e.g., `html`, `xml`, `jsx`, `tsx`, `htx`, `javascriptreact`, `typescriptreact`).
  - Defaults to all Babel-supported markup and JSX-like languages.

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
