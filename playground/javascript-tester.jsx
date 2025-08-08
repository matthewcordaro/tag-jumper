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

// Common form section
function tester() {
  return (
    <>
      <header>
        <h1>Tag Jumper Playground</h1>
        <nav>
          <ul>
            <li>
              <a href='#buttons'>Buttons</a>
            </li>
            <li>
              <a href='#inputs'>Inputs</a>
            </li>
            <li>
              <a href='#widgets'>Widgets</a>
            </li>
          </ul>
        </nav>
      </header>

      <main>
        <section id='buttons'>
          <h2>Buttons</h2>
          <Button data={[1, 2, 3]} />
          <Button onClick={(e) => doSomething(e)} />
          <Button value={(foo = "bar")} />
          <Button value={1 + 2} />
          <Button value={foo ? "a" : "b"} />
          <Button value={getValue()} />
          <Button value={foo && "bar"} />
          <Button value={foo.bar} />
          <Button value={null} />
          <Button value={42} />
          <Button value={"bar"} />
          <Button value={`foo${bar}`} />
          <Button value={this} />
          <Button value={<span>JSX in prop</span>} />
          <Button value={<>{foo}</>} />
        </section>

        <section id='inputs'>
          <h2>Inputs</h2>
          <input
            type='text'
            value='hello'
            onChange={(e) => setValue(e.target.value)}
          />
          <input type='checkbox' checked={true} />
          <input type='radio' name='group' checked={false} />
          <input {...props} />
          <input visible={true} />
          <input value='foo' />
          <input pattern={/abc/} />
          <input style={{ border: "1px solid #ccc", padding: 4 }} />
        </section>

        <section id='widgets'>
          <h2>Widgets</h2>
          <Widget
            content={<span>bar</span>}
            meta={import.meta}
            handler={foo?.()}
            prop={foo?.bar}
            style={{ color: "red" }}
            values={[1, 2]}
            value={tag`template`}
          />
          <Widget content={<>{foo}</>} />
          <Widget
            factory={
              class {
                method() {
                  return 42
                }
              }
            }
          />
        </section>

        <section id='lists'>
          <h2>Lists</h2>
          <ul>
            {[1, 2, 3].map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <ol>
            <li>First</li>
            <li>Second</li>
          </ol>
        </section>

        <section id='forms'>
          <h2>Forms</h2>
          <form onSubmit={(e) => e.preventDefault()}>
            <label htmlFor='name'>Name:</label>
            <input id='name' name='name' />
            <button type='submit'>Submit</button>
          </form>
        </section>

        <section id='misc'>
          <h2>Miscellaneous</h2>
          <div className='box' tabIndex={0}>
            <span style={{ fontWeight: "bold" }}>Bold text</span>
            <br />
            <img src='logo.png' alt='Logo' />
            <hr />
            <a href='https://github.com'>GitHub</a>
          </div>
        </section>
      </main>

      <footer>
        <small>&copy; 2024 Tag Jumper Playground</small>
      </footer>
    </>
  )
}
