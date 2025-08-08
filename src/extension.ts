import * as vscode from "vscode"
import {
  getTagBoundaryPositions,
  getAttributeBoundaryPositions,
} from "./babel-boundary-locator"
import LRU from "lru-cache"
import { createHash } from "crypto"

// LRU cache for boundary positions by text hash
// The cache is intentionally keyed by a hash of the document content, so undo/redo operations
// that restore previous content can instantly reuse cached results. This avoids unnecessary AST parsing.
const boundaryCache = new LRU<string, { tag: number[]; attr: number[] }>({
  max: 20,
})

function hashText(text: string): string {
  return createHash("sha1").update(text).digest("hex")
}

function getCachedBoundaries(text: string, type: "tag" | "attr"): number[] {
  const hash = hashText(text)
  let entry = boundaryCache.get(hash)
  if (!entry) {
    entry = {
      tag: getTagBoundaryPositions(text),
      attr: getAttributeBoundaryPositions(text),
    }
    boundaryCache.set(hash, entry)
  }
  return type === "tag" ? entry.tag : entry.attr
}

/**
 * Generic function to jump the cursor to the next or previous boundary using a boundaryPositions function.
 * @param boundaryPositionsFn - Function that returns an array of boundary positions for the document text.
 * @param direction - The direction to jump: "next" for forward, "prev" for backward.
 */
function jumpToBoundary(
  boundaryPositionsFn: (text: string) => number[],
  direction: "next" | "prev"
) {
  const editor = vscode.window.activeTextEditor
  if (!editor) return

  const text = editor.document.getText()
  const type = boundaryPositionsFn === getTagBoundaryPositions ? "tag" : "attr"
  const positions = getCachedBoundaries(text, type).slice()
  positions.sort((a, b) => a - b)

  const cursorPos = editor.selection.active
  const flatPosition = editor.document.offsetAt(cursorPos)

  // Find the next or previous boundary
  const targetPosition =
    direction === "next"
      ? positions.find((o) => o > flatPosition)
      : [...positions].reverse().find((o) => o < flatPosition)

  if (targetPosition !== undefined) {
    const targetPos = editor.document.positionAt(targetPosition)
    editor.selection = new vscode.Selection(targetPos, targetPos)
    editor.revealRange(new vscode.Range(targetPos, targetPos))
  }
}

/**
 * Activates the extension by registering tag and attribute navigation commands using Babel-based tag detection for tag jumps.
 *
 * @param context - The extension context provided by VS Code.
 */
export function activate(context: vscode.ExtensionContext) {
  // DEV ONLY: Open tester.jsx if it exists in the workspace when debugging
  if (process.env.VSCODE_DEBUG_MODE || process.env.NODE_ENV === "development") {
    const wsFolders = vscode.workspace.workspaceFolders
    if (wsFolders) {
      const testerPath = vscode.Uri.joinPath(wsFolders[0].uri, "tester.jsx")
      vscode.workspace.openTextDocument(testerPath).then(
        (doc) => {
          vscode.window.showTextDocument(doc, { preview: false })
        },
        () => {
          /* ignore if not found */
        }
      )
    }
  }

  context.subscriptions.push(
    vscode.commands.registerCommand("tag-jumper.jumpForwardTag", () => {
      jumpToBoundary(getTagBoundaryPositions, "next")
    }),

    vscode.commands.registerCommand("tag-jumper.jumpBackwardTag", () => {
      jumpToBoundary(getTagBoundaryPositions, "prev")
    }),

    vscode.commands.registerCommand("tag-jumper.jumpForwardAttribute", () => {
      jumpToBoundary(getAttributeBoundaryPositions, "next")
    }),

    vscode.commands.registerCommand("tag-jumper.jumpBackwardAttribute", () => {
      jumpToBoundary(getAttributeBoundaryPositions, "prev")
    })
  )
}
