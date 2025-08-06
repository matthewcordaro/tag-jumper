import * as assert from "assert"
import getTagBoundaryPosition, {
  findNextTag,
  classifyNextTag,
} from "../tag-boundary-locator"

suite("tag-boundary-locator.ts", () => {
  suite("findNextElement() tests", () => {
    test("returns null when no tags are present", () => {
      const text = "plain text without tags"
      assert.strictEqual(findNextTag(text, 0), null)
      assert.strictEqual(findNextTag(text, 10), null)
    })

    test("finds a simple opening tag at position 0", () => {
      const text = "<div>content</div>"
      const result = findNextTag(text, 0)
      assert.deepStrictEqual(result, [0, text.indexOf(">")])
    })

    test("finds an opening tag after some text", () => {
      const text = '   <span id="x">'
      const start = text.indexOf("<")
      const end = text.lastIndexOf(">")
      assert.deepStrictEqual(findNextTag(text, 0), [start, end])
    })

    test("finds a self-closing tag without space", () => {
      const text = '<img src="foo.png"/>'
      const start = 0
      const end = text.lastIndexOf(">")
      assert.deepStrictEqual(findNextTag(text, 0), [start, end])
    })

    test("finds a self-closing tag with space", () => {
      const text = "<br />"
      const start = 0
      const end = text.lastIndexOf(">")
      assert.deepStrictEqual(findNextTag(text, 0), [start, end])
    })

    test("returns the next tag when startPos is inside a tag", () => {
      const text = "<p>one</p>"
      const afterP = 1 // start inside "<p>"
      assert.deepStrictEqual(findNextTag(text, afterP), [
        text.indexOf("</p>"),
        text.lastIndexOf(">"),
      ])
    })

    test("returns null when startPos is inside the last tag", () => {
      const text = "<p>one</p>"
      const afterLast = text.lastIndexOf("</p>") + 1 // start inside "</p>"
      assert.strictEqual(findNextTag(text, afterLast), null)
    })

    test("finds tag properly with any '<' or '>' in an attribute value", () => {
      const text = '<input text="<><><>" />'
      const start = 0
      const end = text.lastIndexOf(">")
      assert.deepStrictEqual(findNextTag(text, 0), [start, end])
    })

    test("finds next tag properly when starting in an element that contains '<' or '>' in an attribute", () => {
      const text = '<input text="<><><>" /><br />'
      const start = text.indexOf("<br />")
      const end = text.lastIndexOf(">")
      assert.deepStrictEqual(findNextTag(text, 2), [start, end])
    })

    suite("finds next tag properly when starting in an attribute values", () => {
      test("contains jsx {'<...>'}", () => {
        const text = "<input name='nickname' text={'><test1><><'} />"
        const start = 0
        const end = text.lastIndexOf(">")
        // start from inside the attribute value text={'><test1><><'}
        const fromInsideAttr = text.indexOf("><test1><><")
        assert.deepStrictEqual(findNextTag(text, fromInsideAttr), [start, end])
      })

      test("contains '<...>'", () => {
        const text = "<input name='nickname' text='><test2><><' />"
        const start = 0
        const end = text.lastIndexOf(">")
        // start from inside the attribute value text='><test2><><'
        const fromInsideAttr = text.indexOf("><test2><><")
        assert.deepStrictEqual(findNextTag(text, fromInsideAttr), [start, end])
      })
    })
  })

  suite("classifyNextTag() tests", () => {
    test("returns null when no tags remain", () => {
      const text = "nothing here"
      assert.strictEqual(classifyNextTag(text, 0), null)
    })

    test("classifies an opening tag", () => {
      const text = '<div class="a">'
      const [type, start, end] = classifyNextTag(text, 0)!
      assert.strictEqual(type, "open")
      assert.strictEqual(start, 0)
      assert.strictEqual(end, text.indexOf(">"))
    })

    test("classifies a closing tag", () => {
      const text = "</div>"
      const [type, start, end] = classifyNextTag(text, 0)!
      assert.strictEqual(type, "close")
      assert.strictEqual(start, 0)
      assert.strictEqual(end, text.indexOf(">"))
    })

    test("classifies a self-closing tag", () => {
      const text = '<img src="x" />'
      const [type, start, end] = classifyNextTag(text, 0)!
      assert.strictEqual(type, "self")
      assert.strictEqual(start, 0)
      assert.strictEqual(end, text.lastIndexOf(">"))
    })

    test("finds and classifies the next tag even if startPos is mid-text", () => {
      const text = "foo <br/>"
      const [type, start, end] = classifyNextTag(text, 0)!
      assert.strictEqual(type, "self")
      assert.strictEqual(start, text.indexOf("<br/>"))
      assert.strictEqual(end, text.lastIndexOf(">"))
    })

    test("finds and classifies a comment", () => {
      const text = "<!-- comment -->"
      const [type, start, end] = classifyNextTag(text, 0)!
      assert.strictEqual(type, "comment")
      assert.strictEqual(start, 0)
      assert.strictEqual(end, text.indexOf(">"))
    })
  })

  suite("getTagBoundaryPosition() tests", () => {
    test("returns null when no open or self-closing tags exist", () => {
      const text = "no tags here"
      assert.strictEqual(getTagBoundaryPosition(text, 0), null)
      assert.strictEqual(getTagBoundaryPosition(text, 5), null)
    })

    test("returns the correct boundary for an opening tag", () => {
      const text = "<h1>Title</h1>"
      // < at 0, > at 3, boundary is 3
      assert.strictEqual(getTagBoundaryPosition(text, 0), 3)
    })

    test("returns the correct boundary for a self-closing tag", () => {
      const text = "<br/>"
      // <br/> => boundary at slash index 3
      assert.strictEqual(getTagBoundaryPosition(text, 0), 3)
    })

    test("returns the correct boundary for a self-closing tag with space", () => {
      const text = "<img />"
      // slash at index 5
      assert.strictEqual(getTagBoundaryPosition(text, 0), 5)
    })

    test("skips closing tags and finds the next open", () => {
      const text = "</closed><span>"
      // starting at 0, skip </closed>, jump to <span>
      const expectedBoundary = text.lastIndexOf(">") // index of '>' in <span>
      assert.strictEqual(getTagBoundaryPosition(text, 0), expectedBoundary)
    })

    test("finds the next boundary after the cursor position", () => {
      const text = "<div><hr/><p></p>"
      // first boundary at <div> => 4
      assert.strictEqual(getTagBoundaryPosition(text, 0), 4)
      // next boundary after <div> => <hr/> boundary at 8
      const afterDiv = 4 + 1
      const expectedBoundary = text.indexOf("/><p></p>")
      assert.strictEqual(
        getTagBoundaryPosition(text, afterDiv),
        expectedBoundary
      )
    })

    test("skips current tag and the following closing tag to find the next open", () => {
      const text = "<div></div><span>"
      // starting in <div>, skip <div></div>, jump to <span>
      const expectedBoundary = text.lastIndexOf(">") // index of '>' in <span>
      assert.strictEqual(getTagBoundaryPosition(text, 2), expectedBoundary)
    })

    test("handles tags with special characters in attributes", () => {
      const text = "<input name='nickname' text={'><><><'} />"
      // boundary at the end of the self-closing tag
      assert.strictEqual(
        getTagBoundaryPosition(text, 0),
        text.lastIndexOf("/>")
      )
    })
  })
})
