/**
 * Finds the next valid HTML/JSX/TSX element in `text` at or after `startPos`.
 * Returns a tuple [startOffset, endOffset] where:
 *   - startOffset is the index of '<'
 *   - endOffset is the index of the matching '>'
 * Skips over comments (`<!-- ... -->`) and malformed tags.
 */
export function findNextElement(
  text: string,
  startPos: number
): [number, number] | null {
  // This regex matches:
  //  • optional leading slash
  //  • a tag name starting with a letter
  //  • any number of attributes (naively allowing quoted values)
  //  • optional trailing slash (for self-closing)
  //  • the closing '>'
  const elementPattern =
    /<(?:\/)?[A-Za-z][\w:.-]*(?:\s+(?:[^"'<>]|"[^"]*"|'[^']*'))*\s*(?:\/?)>/g

  // This regex matches HTML comments so we can skip them
  const commentPattern = /<!--[\s\S]*?-->/g

  elementPattern.lastIndex = startPos
  let match: RegExpExecArray | null

  while ((match = elementPattern.exec(text))) {
    const tagText = match[0]
    const tagStart = match.index
    const tagEnd = elementPattern.lastIndex - 1 // index of '>'

    // If it’s a comment, skip it
    // (comments also start with '<!--', but our elementPattern won’t match them,
    //  so this is just extra safety in case of edge cases)
    if (tagText.startsWith("<!--")) {
      // Advance past this comment and continue
      commentPattern.lastIndex = tagStart
      const c = commentPattern.exec(text)
      if (c) {
        elementPattern.lastIndex = commentPattern.lastIndex
      }
      continue
    }

    // We’ve found a well-formed tag. Return its boundaries.
    return [tagStart, tagEnd]
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
type ElementType = "open" | "close" | "self"
export function classifyNextElement(
  text: string,
  startPos: number
): [ElementType, number, number] | null {
  const bounds = findNextElement(text, startPos)
  if (!bounds) return null
  const [start, end] = bounds

  //Chop off the `<` & `>` parts along with any whitespace
  const tagContent = text.slice(start + 1, end).trim()

  // Determine type
  const type: ElementType = tagContent.endsWith("/")
    ? "self"
    : tagContent.startsWith("/")
    ? "close"
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
  let cursor = position;

  while (true) {
    const next = classifyNextElement(text, cursor);
    if (!next) return null;

    const [type, start, end] = next;

    if (type === 'open' || type === 'self') {
      // end is index of '>'; boundary is one char before that
      return end - 1;
    }

    // skip past this closing tag and continue searching
    cursor = end + 1;
  }
}