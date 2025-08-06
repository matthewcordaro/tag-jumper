/**
 * Finds the next valid HTML/JSX/TSX tag in the given text starting from
 * the specified position.
 *
 * Returns a tuple [startOffset, endOffset] where:
 *   - startOffset is the index of '<'
 *   - endOffset is the index of the matching '>'
 *
 * Return a null value if no next tag is found.
 *
 * Skips over attribute values and whitespaces.
 *
 * If startPos is inside a tag, returns the next tag.
 */
export function findNextTag(
  text: string,
  startPos: number
): [number, number] | null {
  if (startPos >= text.length) {
    return null
  }

  let inSingle = false
  let inDouble = false
  let inJSBlock = false
  let prevChar = ""
  let i = startPos

  while (i < text.length) {
    const char = text[i]

    // Toggle JS block (for JSX/TSX: {...})
    if (!inSingle && !inDouble) {
      if (char === "{" && prevChar === "=") {
        inJSBlock = true
      } else if (char === "}" && inJSBlock) {
        inJSBlock = false
      }
    }

    // Toggle quotes (skip escaped quotes)
    if (!inJSBlock) {
      if (char === "'" && !inDouble && prevChar !== "\\") {
        inSingle = !inSingle
      } else if (char === '"' && !inSingle && prevChar !== "\\") {
        inDouble = !inDouble
      }
    }

    // Only consider '<' if not inside quotes or JS block
    if (char === "<" && !inSingle && !inDouble && !inJSBlock) {
      // Now find the matching '>' for this tag, skipping over quoted/JS content inside tag
      let j = i + 1
      let tagInSingle = false
      let tagInDouble = false
      let tagInJSBlock = false
      let tagPrevChar = ""
      while (j < text.length) {
        const c = text[j]
        if (!tagInSingle && !tagInDouble) {
          if (c === "{" && tagPrevChar === "=") {
            tagInJSBlock = true
          } else if (c === "}" && tagInJSBlock) {
            tagInJSBlock = false
          }
        }
        if (!tagInJSBlock) {
          if (c === "'" && !tagInDouble && tagPrevChar !== "\\") {
            tagInSingle = !tagInSingle
          } else if (c === '"' && !tagInSingle && tagPrevChar !== "\\") {
            tagInDouble = !tagInDouble
          }
        }
        if (c === ">" && !tagInSingle && !tagInDouble && !tagInJSBlock) {
          return [i, j]
        }
        tagPrevChar = c
        j++
      }
      // If we never found a closing '>', it's not a valid tag
      return null
    }
    prevChar = char
    i++
  }
  return null
}

/**
 * Finds the next HTML/JSX/TSX element and classifies its kind.
 *
 * @param text full document string to scan
 * @param startPos index from which to begin searching
 * @returns [type, startOffset, endOffset] or null if none found
 */
type ElementType = "open" | "close" | "self" | "comment"
export function classifyNextElement(
  text: string,
  startPos: number
): [ElementType, number, number] | null {
  const bounds = findNextTag(text, startPos)
  if (!bounds) return null
  const [start, end] = bounds

  //Chop off the `<` & `>` parts along with any whitespace
  const tagContent = text.slice(start + 1, end).trim()

  // Determine type
  const type: ElementType = tagContent.endsWith("/")
    ? "self"
    : tagContent.startsWith("/")
    ? "close"
    : tagContent.startsWith("!--")
    ? "comment"
    : "open"

  return [type, start, end]
}

/**
 * Scans forward from a given cursor position in the text and returns the index
 * immediately before the closing character of the next open or self-closing
 * HTML/XML element. All closing tags are skipped over.
 *
 * <p>
 * For an open element (`<tag …>`), the boundary is just before the `>` character.
 * For a self-closing element (`<tag …/>`), the boundary is just before the `/>` sequence.
 * </p>
 *
 * @param text
 *   The full document text to scan.
 * @param position
 *   The zero-based index within `text` at which to start the search.
 * @return
 *   The index one position before the `>` of an open tag or before the `/` of a
 *   self-closing tag, or `null` if no further open or self-closing element is found.
 */
export default function getBoundaryOffset(
  text: string,
  position: number
): number | null {
  let cursor = position
  let lastEnd = -1
  while (true) {
    const next = classifyNextElement(text, cursor)
    if (!next) return null
    const [type, start, end] = next
    if (type === "self") {
      return end - 1
    } else if (type === "open") {
      return end
    }
    // skip past this closing tag and continue searching
    cursor = end + 1
    if (cursor <= lastEnd) {
      // Prevent infinite loop if something goes wrong
      return null
    }
    lastEnd = end
  }
}
