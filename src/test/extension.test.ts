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

import * as assert from "assert"
import * as vscode from "vscode"

suite("Tag Jumper Extension", () => {
  test("jumps to next tag boundary", async () => {
    const doc = await vscode.workspace.openTextDocument({
      language: "typescript",
      content: "<div><span>foo</span></div>",
    })
    const editor = await vscode.window.showTextDocument(doc)
    editor.selection = new vscode.Selection(0, 0, 0, 0) // Place cursor at start

    await vscode.commands.executeCommand("tag-jumper.jumpForwardTag")

    // Should land at <div|>
    const expectedPos = doc.getText().indexOf(">")
    assert.strictEqual(doc.offsetAt(editor.selection.active), expectedPos)
  })

  test("jumps to next attribute boundary", async () => {
    const doc = await vscode.workspace.openTextDocument({
      language: "typescript",
      content: '<input type="text" value="foo" />',
    })
    const editor = await vscode.window.showTextDocument(doc)
    editor.selection = new vscode.Selection(0, 0, 0, 0)

    await vscode.commands.executeCommand("tag-jumper.jumpForwardAttribute")

    // Should land inside type attribute "text|"
    const expectedPos =
      doc.getText().indexOf('type="text"') + 'type="text"'.length - 1
    assert.strictEqual(doc.offsetAt(editor.selection.active), expectedPos)
  })

  test("jumps backward to previous tag boundary", async () => {
    const doc = await vscode.workspace.openTextDocument({
      language: "typescript",
      content: "<div><span>foo</span></div>",
    })
    const editor = await vscode.window.showTextDocument(doc)
    // Place cursor in <span>
    const afterSpan = doc.getText().indexOf("<span>") + "<span>".length - 2
    editor.selection = new vscode.Selection(
      doc.positionAt(afterSpan),
      doc.positionAt(afterSpan)
    )

    await vscode.commands.executeCommand("tag-jumper.jumpBackwardTag")

    // Should land at <div|>
    const expectedPos = doc.getText().indexOf(">")
    assert.strictEqual(doc.offsetAt(editor.selection.active), expectedPos)
  })

  test("jumps backward to previous attribute boundary", async () => {
    const doc = await vscode.workspace.openTextDocument({
      language: "typescript",
      content: '<input type="text" value="foo" />',
    })
    const editor = await vscode.window.showTextDocument(doc)
    // Place cursor in value attribute
    const afterValue =
      doc.getText().indexOf('value="foo"') + 'value="foo"'.length - 3
    editor.selection = new vscode.Selection(
      doc.positionAt(afterValue),
      doc.positionAt(afterValue)
    )

    await vscode.commands.executeCommand("tag-jumper.jumpBackwardAttribute")

    // Should land inside type attribute "text|"
    const expectedPos =
      doc.getText().indexOf('type="text"') + 'type="text"'.length - 1
    assert.strictEqual(doc.offsetAt(editor.selection.active), expectedPos)
  })

  test("does not move cursor in file with no tags or attributes (edge cases)", async () => {
    const doc = await vscode.workspace.openTextDocument({
      language: "typescript",
      content: "const foo = 123;",
    })
    const editor = await vscode.window.showTextDocument(doc)
    const afterNo = doc.getText().indexOf("=")
    editor.selection = new vscode.Selection(
      doc.positionAt(afterNo),
      doc.positionAt(afterNo)
    )
    const originalPos = editor.selection.active

    await vscode.commands.executeCommand("tag-jumper.jumpForwardTag")
    assert.deepStrictEqual(editor.selection.active, originalPos)

    await vscode.commands.executeCommand("tag-jumper.jumpBackwardTag")
    assert.deepStrictEqual(editor.selection.active, originalPos)

    await vscode.commands.executeCommand("tag-jumper.jumpForwardAttribute")
    assert.deepStrictEqual(editor.selection.active, originalPos)

    await vscode.commands.executeCommand("tag-jumper.jumpBackwardAttribute")
    assert.deepStrictEqual(editor.selection.active, originalPos)
  })
})
