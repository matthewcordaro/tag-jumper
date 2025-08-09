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

import * as path from "path"
import { runTests } from "@vscode/test-electron"

async function main() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, "../../")
    const extensionTestsPath = path.resolve(__dirname, "./suite/index")
    await runTests({ extensionDevelopmentPath, extensionTestsPath })
  } catch (err) {
    console.error("Failed to run tests")
    process.exit(1)
  }
}

main()
