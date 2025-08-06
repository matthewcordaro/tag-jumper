import * as path from "path"
import Mocha from "mocha"
import { glob } from "glob"

// Register all Mocha globals before any tests run
const mocha = new Mocha({
  ui: "bdd",
  color: true,
})
// This registers all the BDD interface globals (describe, it, before, after, etc.)
mocha.ui("bdd")
// Force load the BDD interface
mocha.suite.emit("pre-require", global, "", mocha)

export function run(): Promise<void> {
  const testsRoot = path.resolve(__dirname, "..")

  return new Promise<void>((resolve, reject) => {
    glob("**/**.test.js", { cwd: testsRoot })
      .then((files: string[]) => {
        // Add files to the test suite
        files.forEach((f: string) => mocha.addFile(path.resolve(testsRoot, f)))

        try {
          // Run the mocha test
          mocha.run((failures: number) => {
            if (failures > 0) {
              reject(new Error(`${failures} tests failed.`))
            } else {
              resolve()
            }
          })
        } catch (err) {
          reject(err)
        }
      })
      .catch(reject)
  })
}

// Ensure CommonJS export for VS Code test runner compatibility
module.exports = { run }
