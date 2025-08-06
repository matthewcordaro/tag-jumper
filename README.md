# Tag Jumper VS Code Extension

## Overview

Tag Jumper is a VS Code extension that lets you quickly jump between tags and (soon) attributes in HTML, HTX, JSX, and TSX files. It is designed for fast keyboard-based navigation of markup, making editing and code review more efficient.

## Features

- **Jump Forward Through Element Tags:** Move the cursor to the next tag boundary with a single shortcut.
- **Jump Backward Through Element Tags:** Move the cursor to the previous tag boundary.
- **(Planned) Jump Forward/Backward Through Element Attributes:** Attribute-level navigation is coming soon.

## Keyboard Shortcuts

- **Jump Forward Tag:** `Ctrl+Super+Alt+Down`
- **Jump Backward Tag:** `Ctrl+Super+Alt+Up`
- **(Planned) Jump Forward Attribute:** `Ctrl+Super+Alt+Right`
- **(Planned) Jump Backward Attribute:** `Ctrl+Super+Alt+Left`

Shortcuts are active in HTML, HTX, JSX, and TSX files when the editor is focused.

## How It Works

- The extension uses a custom parser (`src/offset-locator.ts`) to find tag and attribute boundaries based on the current cursor position.
- Commands are registered in `src/extension.ts` and are available via the command palette and keyboard shortcuts.

## Developer Guide

- **Build:** `npm run compile`
- **Test:** `npm test` (runs in VS Code extension host)
- **Lint:** `npm run lint`
- **Watch:** `npm run watch`
- **Add Tests:** Place new test files in `src/test/`, use Mocha/BDD style, and run `npm run compile-tests` then `npm test`.

## Key Files

- `src/offset-locator.ts`: Tag/attribute boundary logic
- `src/extension.ts`: Command registration and VS Code integration
- `src/test/extension.test.ts`: Main test suite
- `src/test/runTest.ts`: Test runner entry
- `src/test/suite/index.ts`: Mocha suite loader
- `package.json`: Commands, keybindings, and scripts

## Planned

- Attribute-level navigation (see planned keybindings in `package.json`)
- More granular navigation for complex markup

---

For questions or suggestions, open an issue or see `.github/copilot-instructions.md` for AI agent and contributor guidance.
