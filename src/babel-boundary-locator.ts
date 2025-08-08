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
        if (selfClosing) {
          // For self-closing tags, the boundary is just before the '/>'
          boundaries.push(end - 2)
        } else {
          // For open tags, the boundary is just before the '>'
          boundaries.push(end - 1)
        }
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
      // Iterate over all attributes in the opening tag
      for (const attr of path.node.attributes) {
        // All attributes should have an end position
        if (!attr.end) {
          throw new Error(
            `Unexpected missing end position for attribute at position ${
              attr.start ?? "unknown"
            }`
          )
        }
        // Handle spread attributes: <input {...props} />
        if (attr.type === "JSXSpreadAttribute") {
          boundaries.push(attr.end - 1)
        }
        // Handle normal JSX attributes
        else if (attr.type === "JSXAttribute") {
          // Boolean attribute: <input visible />
          if (attr.value === null) {
            boundaries.push(attr.end)
          }
          // Defensive: should never be undefined
          else if (attr.value === undefined) {
            throw new Error(
              `Unexpected undefined attribute value for attribute '${
                attr.name?.name ?? "unknown"
              }' at position ${attr.start ?? "unknown"}`
            )
          }
          // Attribute has a value
          else {
            // String literal, JSX fragment, or JSX element as value
            if (
              attr.value.type === "StringLiteral" || // <input value="foo"
              attr.value.type === "JSXFragment" || // <Widget content={<>{foo}</>} />
              attr.value.type === "JSXElement" // <Widget content={<span>bar</span>} />
            ) {
              boundaries.push(attr.end! - 1)
            }
            // Expression container: <input value={foo} />
            else if (attr.value.type === "JSXExpressionContainer") {
              const exprType = attr.value.expression.type
              const offset = JSX_EXPRESSION_TYPE_OFFSETS[exprType]
              if (typeof offset === "number") {
                boundaries.push(attr.end! + offset)
                // See lookup table for offset meaning
              } else {
                throw new Error(
                  `Unexpected JSXExpressionContainer type '${exprType}' for attribute '${
                    attr.name?.name ?? "unknown"
                  }' at position ${attr.start ?? "unknown"}`
                )
              }
            }
            // Defensive: unknown object with a type
            else if (
              typeof attr.value === "object" &&
              attr.value !== null &&
              "type" in attr.value
            ) {
              throw new Error(
                `Unexpected JSXAttribute value type '${
                  (attr.value as { type: string }).type
                }' for attribute '${
                  attr.name?.name ?? "unknown"
                }' at position ${attr.start ?? "unknown"}`
              )
            }
            // Defensive: completely unexpected value
            else {
              throw new Error(
                `Unexpected JSXAttribute value for attribute '${
                  attr.name?.name ?? "unknown"
                }' at position ${attr.start ?? "unknown"}`
              )
            }
          }
        }
        // Defensive: unknown attribute type
        else {
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
