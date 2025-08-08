// This file contains one example for each JSX expression type and
// attribute/value combination for tag-jumper testing

// JSXExpression Types
const arr = <Button data={[1, 2, 3]} />
const arrow = <Button onClick={(e) => doSomething(e)} />
const assign = <Button value={(foo = "bar")} />
const binary = <Button value={1 + 2} />
const bool = <Checkbox checked={true} />
const call = <Button value={getValue()} />
const classExpr = (
  <Widget
    factory={
      class {
        method() {
          return 42
        }
      }
    }
  />
)
const cond = <Button value={foo ? "a" : "b"} />
const ident = <Button value={foo} />
const jsxElem = <Widget content={<span>bar</span>} />
const jsxFrag = <Button value={<>{foo}</>} />
const logic = <Button value={foo && "bar"} />
const member = <Button value={foo.bar} />
const meta = <Widget meta={import.meta} />
const newExpr = <Button value={new Date()} />
const nullLit = <Button value={null} />
const numLit = <Button value={42} />
const objExpr = <Button style={{ color: "red" }} />
const optCall = <Widget handler={foo?.()} />
const optMember = <Widget prop={foo?.bar} />
const paren = <Widget value={foo} />
const regex = <Widget pattern={/abc/} />
const seq = <Button value={(foo, bar)} />
const str = <Button value={"bar"} />
const tagged = <Widget value={tag`template`} />
const template = <Button value={`foo${bar}`} />
const thisExpr = <Button value={this} />
const tuple = <Widget values={[1, 2]} />

// The following are TypeScript-only or invalid in JSX, so commented out:
// const jsxEmpty = <Button value={/* comment */} />;
// const superExpr = <Widget prop={super.foo} />
// const tsAs = <Widget info={foo as string} />;
// const tsInst = <Widget value={foo<string>} />;
// const tsNonNull = <Widget value={foo!} />;
// const tsSat = <Widget value={foo satisfies Bar} />;
// const tsTypeAssert = <Widget info={<string>foo} />;

// Spread attribute
const spread = <input {...props} />

// Boolean attribute
const boolAttr = <input visible={true} />

// String literal attribute
const strAttr = <input value='foo' />

// JSX attribute with JSXElement
const jsxAttr = <Widget content={<span>bar</span>} />

// JSX attribute with JSXFragment
const jsxFragAttr = <Widget content={<>{foo}</>} />
