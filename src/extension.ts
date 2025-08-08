/**
 * Tag Jumper — VS Code extension for jumping between tags and attributes
 * Copyright (C) 2025 Matthew Cordaro
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import * as vscode from "vscode"
import {
  getTagBoundaryPositions,
  getAttributeBoundaryPositions,
} from "./babel-boundary-locator"
import LRU from "lru-cache"
import { createHash } from "crypto"

// Default value for including tag positions in attribute navigation
const DEFAULT_INCLUDE_TAG_IN_ATTR_NAV = true

// LRU cache for boundary positions by text hash
// The cache is intentionally keyed by a hash of the document content, so undo/redo operations
// that restore previous content can instantly reuse cached results. This avoids unnecessary AST parsing.
const boundaryCache = new LRU<string, number[]>({
  max: 40,
})

function hashText(text: string): string {
  return createHash("sha1").update(text).digest("hex")
}

/**
 * Returns cached boundary positions for a given function and document text.
 *
 * Caches the result of the boundary function (e.g., tag or attribute locator) using a key
 * composed of the document content hash and the function's name. This ensures that each
 * boundary function's results are cached independently for each unique document state.
 *
 * @param text - The full document text to analyze.
 * @param fn - The boundary locator function (must have a unique .name property).
 * @returns The array of boundary positions for the given function and text.
 */
function getCachedBoundaries(
  text: string,
  fn: (text: string) => number[]
): number[] {
  // Use the function's name to distinguish cache entries for different boundary functions
  const fnName = fn.name || "anonymous"
  // Cache key is the hash of the text plus the function name
  const key = hashText(text) + ":" + fnName
  let entry = boundaryCache.get(key)
  if (!entry) {
    // Compute and cache the result if not present
    entry = fn(text)
    boundaryCache.set(key, entry)
  }
  return entry
}

/**
 * Moves the cursor to the next or previous boundary position as determined by one or more boundary locator functions.
 *
 * - Collects all boundary positions from the provided functions.
 * - Deduplicates and sorts the positions.
 * - Finds the next or previous position relative to the current cursor.
 * - Moves the cursor and reveals the new position if found.
 *
 * @param boundaryFns - Array of functions that return arrays of boundary positions for the document text.
 * @param direction - The direction to jump: "next" for forward, "prev" for backward.
 */
function jumpToBoundary(
  boundaryFns: Array<(text: string) => number[]>,
  direction: "next" | "prev"
) {
  // Get the active editor; do nothing if none
  const editor = vscode.window.activeTextEditor
  if (!editor) return

  // Get the full document text
  const text = editor.document.getText()
  // Gather all boundary positions from all functions
  let positions: number[] = []
  for (const fn of boundaryFns) {
    positions = positions.concat(getCachedBoundaries(text, fn))
  }
  // Remove duplicates and sort positions in ascending order
  positions = Array.from(new Set(positions))
  positions.sort((a, b) => a - b)

  // Get the current cursor position as a flat offset
  const cursorPos = editor.selection.active
  const flatPosition = editor.document.offsetAt(cursorPos)

  // Find the next or previous boundary position
  const targetPosition =
    direction === "next"
      ? positions.find((o) => o > flatPosition)
      : [...positions].reverse().find((o) => o < flatPosition)

  // Move the cursor if a target position was found
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
  context.subscriptions.push(
    // Tag navigation commands
    vscode.commands.registerCommand("tag-jumper.jumpForwardTag", () => {
      jumpToBoundary([getTagBoundaryPositions], "next")
    }),

    vscode.commands.registerCommand("tag-jumper.jumpBackwardTag", () => {
      jumpToBoundary([getTagBoundaryPositions], "prev")
    }),

    // Attribute navigation commands
    vscode.commands.registerCommand("tag-jumper.jumpForwardAttribute", () => {
      const config = vscode.workspace.getConfiguration("tag-jumper")
      const includeTag = config.get<boolean>(
        "includeTagPositionsInAttributeNavigation",
        DEFAULT_INCLUDE_TAG_IN_ATTR_NAV
      )
      const fns = includeTag
        ? [getAttributeBoundaryPositions, getTagBoundaryPositions]
        : [getAttributeBoundaryPositions]
      jumpToBoundary(fns, "next")
    }),

    vscode.commands.registerCommand("tag-jumper.jumpBackwardAttribute", () => {
      const config = vscode.workspace.getConfiguration("tag-jumper")
      const includeTag = config.get<boolean>(
        "includeTagPositionsInAttributeNavigation",
        DEFAULT_INCLUDE_TAG_IN_ATTR_NAV
      )
      const fns = includeTag
        ? [getAttributeBoundaryPositions, getTagBoundaryPositions]
        : [getAttributeBoundaryPositions]
      jumpToBoundary(fns, "prev")
    })
  )
}
