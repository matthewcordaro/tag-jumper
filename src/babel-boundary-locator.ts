import { parse } from "@babel/parser"
import traverse from "@babel/traverse"
import type { ParserOptions } from "@babel/parser"

// Lookup table for JSXExpressionContainer types and their offsets
const JSX_EXPRESSION_TYPE_OFFSETS: Record<string, number> = {
  ArrayExpression: -2, // <Button data={[1, 2, 3]} />
  ArrowFunctionExpression: -1, // <Button onClick={e => doSomething(e)} />
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
 * Returns a list of character positions for the end of each open or self-closing JSX/TSX tag in the text.
 *
 * This function ONLY collects boundaries for opening and self-closing tags.
 * - It ignores closing tags (e.g. </div>) because those are represented as JSXClosingElement nodes, which are not visited here.
 * - It ignores JSX comments (for example, curly-brace comments like {slash-star ... star-slash}) because those are not represented as JSXOpeningElement nodes.
 *
 * Only JSXOpeningElement nodes are visited, which represent <tag> and <tag />.
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
 * Returns a list of character positions for the end of every attribute in every JSX/TSX tag in the text.
 * The boundary is the character just after the end of the attribute value (or name for booleans), matching the examples provided.
 */
export function getAttributeBoundaryPositions(text: string): number[] {
  const ast = parse(text, BABEL_PARSE_OPTIONS)

  const boundaries: number[] = []

  traverse(ast, {
    JSXOpeningElement(path) {
      for (const attr of path.node.attributes) {
        if (!attr.end) {
          throw new Error(
            `Unexpected missing end position for attribute at position ${attr.start ?? "unknown"}`
          )
        }
        if (attr.type === "JSXSpreadAttribute") {
          // <input {...props} />
          boundaries.push(attr.end - 1)
        } else if (attr.type === "JSXAttribute") {
          if (attr.value === null) {
            // <input visible />
            boundaries.push(attr.end)
          } else if (attr.value === undefined) {
            throw new Error(
              `Unexpected undefined attribute value for attribute '${
                attr.name?.name ?? "unknown"
              }' at position ${attr.start ?? "unknown"}`
            )
          } else {
            // attr.value is defined
            if (
              attr.value.type === "StringLiteral" || // <input value="foo"
              attr.value.type === "JSXFragment" || // <Widget content={<>{foo}</>} />
              attr.value.type === "JSXElement" // <Widget content={<span>bar</span>} />
            ) {
              boundaries.push(attr.end! - 1)
            } else if (attr.value.type === "JSXExpressionContainer") {
              const exprType = attr.value.expression.type
              const offset = JSX_EXPRESSION_TYPE_OFFSETS[exprType]
              if (typeof offset === "number") {
                boundaries.push(attr.end! + offset)
                // Example: see comment in lookup table
              } else {
                throw new Error(
                  `Unexpected JSXExpressionContainer type '${exprType}' for attribute '${
                    attr.name?.name ?? "unknown"
                  }' at position ${attr.start ?? "unknown"}`
                )
              }
            } else if (
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
            } else {
              throw new Error(
                `Unexpected JSXAttribute value for attribute '${
                  attr.name?.name ?? "unknown"
                }' at position ${attr.start ?? "unknown"}`
              )
            }
          }
        } // attr.type === "JSXAttribute" end
        else {
          // error case
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
