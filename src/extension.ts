import * as vscode from "vscode"
import getBoundaryOffset from "./tag-boundary-locator"
import getAttributeBoundaryOffset from "./tag-attribute-locator"


/**
 * Jumps the cursor to the next or previous attribute boundary within the current editor.
 * Uses `getAttributeBoundaryOffset` to determine attribute boundaries in the document.
 *
 * @param direction - The direction to jump: "next" for forward, "prev" for backward.
 */
function jumpToAttribute(direction: "next" | "prev") {
  const editor = vscode.window.activeTextEditor
  if (!editor) return

  const text = editor.document.getText()
  const cursorPos = editor.selection.active
  const flatOffset = editor.document.offsetAt(cursorPos)

  const attrOffsets: number[] = []

  // Build offset list from full text
  for (let i = 0; i < text.length; i++) {
    const offset = getAttributeBoundaryOffset(text, i)
    if (offset !== null) attrOffsets.push(offset)
  }

  // Sort offsets for consistent navigation
  attrOffsets.sort((a, b) => a - b)

  const targetOffset =
    direction === "next"
      ? attrOffsets.find((o) => o > flatOffset)
      : [...attrOffsets].reverse().find((o) => o < flatOffset)

  if (targetOffset !== undefined) {
    const targetPos = editor.document.positionAt(targetOffset)
    editor.selection = new vscode.Selection(targetPos, targetPos)
    editor.revealRange(new vscode.Range(targetPos, targetPos))
  }
}


/**
 * Jumps the cursor to the next or previous tag boundary within the current editor.
 * Uses `getBoundaryOffset` to determine tag boundaries in the document.
 *
 * @param direction - The direction to jump: "next" for forward, "prev" for backward.
 */
function jumpToBoundary(direction: "next" | "prev") {
  const editor = vscode.window.activeTextEditor
  if (!editor) return

  const text = editor.document.getText()
  const cursorPos = editor.selection.active
  const flatOffset = editor.document.offsetAt(cursorPos)

  const tagOffsets: number[] = []

  // Build offset list from full text
  for (let i = 0; i < text.length; i++) {
    const offset = getBoundaryOffset(text, i)
    if (offset !== null) tagOffsets.push(offset)
  }

  // Sort offsets for consistent navigation
  tagOffsets.sort((a, b) => a - b)

  const targetOffset =
    direction === "next"
      ? tagOffsets.find((o) => o > flatOffset)
      : [...tagOffsets].reverse().find((o) => o < flatOffset)

  if (targetOffset !== undefined) {
    const targetPos = editor.document.positionAt(targetOffset)
    editor.selection = new vscode.Selection(targetPos, targetPos)
    editor.revealRange(new vscode.Range(targetPos, targetPos))
  }
}

/**
 * Activates the extension by registering tag and attribute navigation commands.
 * Adds commands for jumping to next/previous tag and attribute boundaries.
 *
 * @param context - The extension context provided by VS Code.
 */
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("tag-jumper.jumpForwardTag", () => {
      jumpToBoundary("next")
    }),

    vscode.commands.registerCommand("tag-jumper.jumpBackwardTag", () => {
      jumpToBoundary("prev")
    })
  )
  //Add commands for attribute navigation
  context.subscriptions.push(
    vscode.commands.registerCommand("tag-jumper.jumpForwardAttribute", () => {
      jumpToAttribute("next")
    }),

    vscode.commands.registerCommand("tag-jumper.jumpBackwardAttribute", () => {
      jumpToAttribute("prev")
    })
  )
}
