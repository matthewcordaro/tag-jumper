import * as vscode from "vscode"
import getTagBoundaryPosition from "./tag-boundary-locator"
import getAttributeBoundaryOffset from "./tag-attribute-locator"

/**
 * Generic function to jump the cursor to the next or previous location (tag or attribute) within the current editor.
 * Determines locations using the provided locator function.
 *
 * @param locator - A function that locates positions in the document.
 * @param direction - The direction to jump: "next" for forward, "prev" for backward.
 */
function jumpToLocation(
  locator: (text: string, i: number) => number | null,
  direction: "next" | "prev"
) {
  const editor = vscode.window.activeTextEditor
  if (!editor) return

  // Get the full document text and current cursor position
  const text = editor.document.getText()
  const cursorPos = editor.selection.active
  const flatPosition = editor.document.offsetAt(cursorPos)

  // Collect all valid jump locations using the locator function
  const positions: number[] = []
  for (let i = 0; i < text.length; i++) {
    const position = locator(text, i)
    if (position !== null) positions.push(position)
  }
  // Sort locations in ascending order
  positions.sort((a, b) => a - b)

  // Find the next or previous location relative to the cursor
  const targetPosition =
    direction === "next"
      ? positions.find((o) => o > flatPosition)
      : [...positions].reverse().find((o) => o < flatPosition)

  // Move the cursor if a valid location is found
  if (targetPosition !== undefined) {
    const targetPos = editor.document.positionAt(targetPosition)
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
      jumpToLocation(getTagBoundaryPosition, "next")
    }),

    vscode.commands.registerCommand("tag-jumper.jumpBackwardTag", () => {
      jumpToLocation(getTagBoundaryPosition, "prev")
    }),

    vscode.commands.registerCommand("tag-jumper.jumpForwardAttribute", () => {
      jumpToLocation(getAttributeBoundaryOffset, "next")
    }),

    vscode.commands.registerCommand("tag-jumper.jumpBackwardAttribute", () => {
      jumpToLocation(getAttributeBoundaryOffset, "prev")
    })
  )
}
