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

import { parse } from "@babel/parser"
import traverse from "@babel/traverse"
import type { JSXAttribute } from "@babel/types"
import type { ParserOptions } from "@babel/parser"

// Lookup table for JSXExpressionContainer types and their offsets
const JSX_EXPRESSION_TYPE_OFFSETS: Record<string, number> = {
  ArrayExpression: -2, // <Button data={[1, 2, 3]} />
  ArrowFunctionExpression: -2, // <Button onClick={e => doSomething(e)} />
  AssignmentExpression: -2, // <Button value={(foo = 'bar')} />
  AwaitExpression: -1, // <Widget data={await fetchData()} />
  BigIntLiteral: -1, // <Widget count={123n} />
  BindExpression: -1, // <Widget handler={::foo} />
  BinaryExpression: -1, // <Button value={1 + 2} />
  BooleanLiteral: -1, // <Checkbox checked={true} />
  CallExpression: -1, // <Button value={getValue()} />
  ClassExpression: -2, // <Widget factory={class { method() { return 42 } }} />
  ConditionalExpression: -1, // <Button value={foo ? 'a' : 'b'} />
  DecimalLiteral: -1, // <Widget value={1.23m} />
  DoExpression: -2, // <Widget result={do { let x = 1; x + 1 }} />
  Identifier: -1, // <Button value={foo} />
  ImportExpression: -3, // <Widget module={import("foo")} />
  JSXElement: -1, // <Widget content={<span>bar</span>} />
  JSXEmptyExpression: -1, // <Button value={/* comment */} />
  JSXFragment: -1, // <Button value={<>{foo}</>} />
  LogicalExpression: -1, // <Button value={foo && 'bar'} />
  MemberExpression: -1, // <Button value={foo.bar} />
  MetaProperty: -1, // <Widget meta={import.meta} />
  ModuleExpression: -2, // <Widget config={module {}} />
  NewExpression: -1, // <Button value={new Date()} />
  NullLiteral: -1, // <Button value={null} />
  NumericLiteral: -1, // <Button value={42} />
  ObjectExpression: -2, // <Button style={{ color: 'red' }} />
  OptionalCallExpression: -1, // <Widget handler={foo?.()} />
  OptionalMemberExpression: -1, // <Widget prop={foo?.bar} />
  ParenthesizedExpression: -2, // <Widget value={(foo)} />
  PipelineBareFunction: -1, // <Widget value={foo |> bar} />
  PipelinePrimaryTopicReference: -1, // <Widget value={#} />
  PipelineTopicExpression: -1, // <Widget value={foo |> #} />
  RecordExpression: -1, // <Widget data=#{ a: 1 } />
  RegExpLiteral: -2, // <Widget pattern={/abc/} />
  SequenceExpression: -2, // <Button value={(foo, bar)} />
  StringLiteral: -2, // <Button value={"bar"} />
  Super: -1, // <Widget prop={super.foo} />
  TaggedTemplateExpression: -2, // <Widget value={tag`template`} />
  TemplateLiteral: -2, // <Button value={`foo${bar}`} />
  ThisExpression: -1, // <Button value={this} />
  TopicReference: -1, // <Widget value={#} />
  TSAsExpression: -1, // <Widget info={foo as string} />
  TSInstantiationExpression: -1, // <Widget value={foo<string>} />
  TSNonNullExpression: -1, // <Widget value={foo!} />
  TSSatisfiesExpression: -1, // <Widget value={foo satisfies Bar} />
  TSTypeAssertion: -1, // <Widget info={<string>foo} />
  TupleExpression: -2, // <Widget values={[1, 2]} />
}

/**
 * Babel parser options for analyzing JSX/TSX code.
 */
const BABEL_PARSE_OPTIONS: ParserOptions = {
  sourceType: "module",
  plugins: ["jsx", "typescript"],
  ranges: true,
}

/**
 * Returns a list of character positions for the end of each opening or self-closing JSX/TSX tag in the given text.
 *
 * - Only collects boundaries for opening and self-closing tags (e.g., `<div>`, `<input />`).
 * - Ignores closing tags (e.g., `</div>`), as those are not represented as JSXOpeningElement nodes.
 * - Ignores JSX comments and other non-tag nodes.
 * - The returned positions are offsets just before the closing '>' or '/>' of each tag.
 *
 * @example
 *   For `<div className="foo">bar</div>`, returns the offset just before '>bar'.
 *
 * @param text - The full document text to analyze.
 * @returns An array of character offsets for tag boundaries.
 */
export function getTagBoundaryPositions(text: string): number[] {
  const ast = parse(text, BABEL_PARSE_OPTIONS)
  const boundaries: number[] = []

  traverse(ast, {
    // Only opening and self-closing tags are visited here
    JSXOpeningElement(path) {
      const { end, selfClosing } = path.node
      if (typeof end === "number") {
        if (selfClosing) boundaries.push(end - 2) // Self-closing tag
        else boundaries.push(end - 1) // Opening tag
      }
    },
  })

  return boundaries
}

/**
 * Returns a list of character positions for the end of every attribute in every JSX/TSX tag in the given text.
 *
 * - The boundary is the character just after the end of the attribute value (or name for boolean attributes).
 * - Handles all attribute types, including spread attributes, string literals, expressions, fragments, and booleans.
 * - Throws an error if an unexpected attribute structure is encountered.
 *
 * Internally, this function uses a top-level switch on attribute type and delegates JSXAttribute value handling
 * to the getJSXAttributeBoundary helper for clarity and maintainability.
 *
 * @example
 *   // For `<input value="foo" checked />`, returns offsets after 'foo', before the '"', and after 'checked'.
 *
 * @param text - The full document text to analyze.
 * @returns An array of character offsets for attribute boundaries.
 */
export function getAttributeBoundaryPositions(text: string): number[] {
  const ast = parse(text, BABEL_PARSE_OPTIONS)
  const boundaries: number[] = []

  traverse(ast, {
    JSXOpeningElement(path) {
      for (const attr of path.node.attributes) {
        // Defensive: all attributes should have an end position
        if (!attr.end) {
          const attrStart = attr.start ?? "unknown"
          throw new Error(
            `Unexpected missing end position for attribute at position ${attrStart}`
          )
        }

        // Handle each attribute type
        switch (attr.type) {
          case "JSXSpreadAttribute":
            // JSXSpreadAttribute: <input {...props} />
            boundaries.push(attr.end - 1)
            break
          case "JSXAttribute":
            // JSXAttribute: delegate to helper for all value types
            boundaries.push(getJSXAttributeBoundary(attr))
            break
          default:
            // Defensive: unknown attribute type
            const attrType = (attr as any).type ?? "unknown"
            const attrStart = (attr as any).start ?? "unknown"
            throw new Error(
              `Unexpected attribute type '${attrType}' at position ${attrStart}`
            )
        }
      }
    },
  })

  return boundaries
}

/**
 * Computes the boundary position of a JSX attribute in source code.
 *
 * Determines the end boundary of a JSX attribute, which varies depending on the attribute's value type:
 * - For boolean attributes (e.g., `<input visible />`), the boundary is at the end of the attribute name.
 * - For string literals, JSX fragments, or JSX elements as values, the boundary is just before the closing quote or tag.
 * - For expression containers (e.g., `<input value={foo} />`), the boundary is calculated using a lookup table based on the expression type.
 *
 * Throws an error if the attribute value is undefined or of an unexpected type.
 *
 * @param attr - The JSX attribute node (from Babel AST), containing name, value, start, and end positions.
 * @returns The numeric position in the source code representing the boundary of the attribute.
 * @throws {Error} If the attribute value is undefined, missing, or of an unknown/unsupported type.
 */
function getJSXAttributeBoundary(attr: JSXAttribute): number {
  // Defensive: end should be a number
  if (typeof attr.end !== "number") {
    const attrName = attr.name?.name ?? "unknown"
    const attrStart = attr.start ?? "unknown"
    throw new Error(
      `Unexpected missing end position for attribute '${attrName}' at position ${attrStart}`
    )
  }

  // Boolean attribute: <input visible />
  if (attr.value === null) return attr.end

  // Defensive: should never be undefined
  if (attr.value === undefined) {
    const attrName = attr.name?.name ?? "unknown"
    const attrStart = attr.start ?? "unknown"
    throw new Error(
      `Unexpected undefined attribute value for attribute '${attrName}' at position ${attrStart}`
    )
  }

  // StringLiteral, JSXFragment, or JSXElement type
  if (
    attr.value.type === "StringLiteral" || // <input value="foo"
    attr.value.type === "JSXFragment" || // <Widget content={<>{foo}</>} />
    attr.value.type === "JSXElement" // <Widget content={<span>bar</span>} />
  )
    return attr.end - 1

  // JSXExpressionContainer: use the offset lookup table
  if (attr.value.type === "JSXExpressionContainer")
    return attr.end + JSX_EXPRESSION_TYPE_OFFSETS[attr.value.expression.type]

  // Defensive: unknown object with a type
  if (attr.value && typeof attr.value === "object" && "type" in attr.value) {
    const valueType = (attr.value as { type: string }).type
    const attrName = attr.name?.name ?? "unknown"
    const attrStart = attr.start ?? "unknown"
    throw new Error(
      `Unexpected JSXAttribute value type '${valueType}' for attribute '${attrName}' at position ${attrStart}`
    )
  }

  // Defensive: completely unexpected value
  const attrName = attr.name?.name ?? "unknown"
  const attrStart = attr.start ?? "unknown"
  throw new Error(
    `Unexpected JSXAttribute value for attribute '${attrName}' at position ${attrStart}`
  )
}
