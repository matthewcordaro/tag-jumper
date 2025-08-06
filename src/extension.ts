import * as vscode from "vscode"
import getBoundaryOffset from "./offset-locator"

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

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("element-jumper.next", () => {
      jumpToBoundary("next")
    }),

    vscode.commands.registerCommand("element-jumper.prev", () => {
      jumpToBoundary("prev")
    })
  )
}
