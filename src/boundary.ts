
type Matcher = (text: string, position: number) => number | null

/**
 * Matches self-closing tags like <img />
 * Returns position right before `/`
 */
const matchSelfClosing: Matcher = (text, pos) => {
  const close = text.indexOf("/>", pos)
  if (close > -1) {
    return text[close - 1] === "/" ? close - 1 : close
  }
  return null
}

/**
 * Matches opening tags like <div>
 * Returns position right before `>`
 */
const matchOpeningTag: Matcher = (text, pos) => {
  const open = text.indexOf(">", pos)
  if (open > -1 && text[open - 1] !== "/") {
    // Check it's not closing or self-closing
    const tagStart = text.lastIndexOf("<", open)
    if (tagStart > -1 && text[tagStart + 1] !== "/") return open
  }
  return null
}

/**
 * Skip closing tags like </div>
 */
const matchers: Matcher[] = [
  matchSelfClosing,
  matchOpeningTag,
  // Add others here later (e.g. fragments)
]

export default function getBoundaryOffset(
  text: string,
  position: number
): number | null {
  for (const matcher of matchers) {
    const offset = matcher(text, position)
    if (offset !== null) return offset
  }
  return null
}
