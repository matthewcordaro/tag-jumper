import * as assert from "assert"
import * as vscode from "vscode"

// Update the import path as needed for your project structure:
import getBoundaryOffset, {
  classifyNextElement,
  findNextElement,
} from "../offset-locator";

// Optionally keep this if you want a VS Code notification when tests start
vscode.window.showInformationMessage("Start all tests.")

describe("offset-locator.ts", () => {
  describe("findNextElement()", () => {
    it("returns null when no tags are present", () => {
      const text = "plain text without tags"
      assert.strictEqual(findNextElement(text, 0), null)
      assert.strictEqual(findNextElement(text, 10), null)
    })

    it("finds a simple opening tag at position 0", () => {
      const text = "<div>content</div>"
      const result = findNextElement(text, 0)
      assert.deepStrictEqual(result, [0, text.indexOf(">")])
    })

    it("finds an opening tag after some text", () => {
      const text = '   <span id="x">'
      const start = text.indexOf("<span")
      const end = text.indexOf(">")
      assert.deepStrictEqual(findNextElement(text, 0), [start, end])
    })

    it("finds a self-closing tag without space", () => {
      const text = '<img src="foo.png"/>'
      const start = 0
      const end = text.lastIndexOf(">")
      assert.deepStrictEqual(findNextElement(text, 0), [start, end])
    })

    it("finds a self-closing tag with space", () => {
      const text = "<br />"
      const start = 0
      const end = text.lastIndexOf(">")
      assert.deepStrictEqual(findNextElement(text, 0), [start, end])
    })

    it("skips HTML comments", () => {
      const text = '<!-- comment --><a href="#">x</a>'
      // first valid tag is <a>
      const expectedStart = text.indexOf("<a")
      const expectedEnd = text.indexOf(">")
      assert.deepStrictEqual(findNextElement(text, 0), [
        expectedStart,
        expectedEnd,
      ])
    })

    it("returns the next tag when startPos is inside a tag", () => {
      const text = "<p>one</p><hr/>"
      // start inside "<p>"
      assert.deepStrictEqual(findNextElement(text, 1), [0, 2])
      // then skip past closing </p> and find <hr/>
      const afterP = text.indexOf("</p>") + 1
      assert.deepStrictEqual(findNextElement(text, afterP), [
        text.indexOf("<hr"),
        text.lastIndexOf(">"),
      ])
    })
  })

  describe("classifyNextElement()", () => {
    it("returns null when no tags remain", () => {
      const text = "nothing here"
      assert.strictEqual(classifyNextElement(text, 0), null)
    })

    it("classifies an opening tag", () => {
      const text = '<div class="a">'
      const [type, start, end] = classifyNextElement(text, 0)!
      assert.strictEqual(type, "open")
      assert.strictEqual(start, 0)
      assert.strictEqual(end, text.indexOf(">"))
    })

    it("classifies a closing tag", () => {
      const text = "</div>"
      const [type, start, end] = classifyNextElement(text, 0)!
      assert.strictEqual(type, "close")
      assert.strictEqual(start, 0)
      assert.strictEqual(end, text.indexOf(">"))
    })

    it("classifies a self-closing tag", () => {
      const text = '<img src="x" />'
      const [type, start, end] = classifyNextElement(text, 0)!
      assert.strictEqual(type, "self")
      assert.strictEqual(start, 0)
      assert.strictEqual(end, text.lastIndexOf(">"))
    })

    it("finds and classifies the next tag even if startPos is mid-text", () => {
      const text = "foo <span/>"
      const [type, start] = classifyNextElement(text, 0)!
      assert.strictEqual(type, "self")
      assert.strictEqual(start, text.indexOf("<span"))
    })
  })

  describe("getBoundaryOffset()", () => {
    it("returns null when no open or self-closing tags exist", () => {
      const text = "no tags here"
      assert.strictEqual(getBoundaryOffset(text, 0), null)
      assert.strictEqual(getBoundaryOffset(text, 5), null)
    })

    it("returns the correct boundary for an opening tag", () => {
      const text = "<h1>Title</h1>"
      // < at 0, > at 3, boundary is 2
      assert.strictEqual(getBoundaryOffset(text, 0), 2)
    })

    it("returns the correct boundary for a self-closing tag", () => {
      const text = "<br/>"
      // <br/> => boundary at slash index 3
      assert.strictEqual(getBoundaryOffset(text, 0), 3)
    })

    it("returns the correct boundary for a self-closing tag with space", () => {
      const text = "<img />"
      // slash at index 5
      assert.strictEqual(getBoundaryOffset(text, 0), 5)
    })

    it("skips closing tags and finds the next open", () => {
      const text = "</closed><span>"
      // starting at 0, skip </closed>, jump to <span>
      const expectedBoundary = text.indexOf(">") - 1 // index of '>' in <span>
      assert.strictEqual(getBoundaryOffset(text, 0), expectedBoundary)
    })

    it("finds the next boundary after the cursor position", () => {
      const text = "<div><hr/><p></p>"
      // first boundary at <div> => 3
      assert.strictEqual(getBoundaryOffset(text, 0), 3)
      // next boundary after <div> => <hr/> boundary 6
      const afterDiv = 3 + 1
      assert.strictEqual(getBoundaryOffset(text, afterDiv), 6)
    })
  })
})
