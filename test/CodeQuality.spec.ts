import { exec } from "child_process"
import { describe, it } from "vitest"

import { parse as parse_html } from "node-html-parser"
import { readFileSync } from "fs"
import ScriptUtils from "../scripts/ScriptUtils"
function detectInCode(forbidden: string, reason: string) {
    return wrap(detectInCodeUnwrapped(forbidden, reason))
}
/**
 *
 * @param forbidden: a GREP-regex. This means that '.' is a wildcard and should be escaped to match a literal dot
 * @param reason
 * @private
 */
function detectInCodeUnwrapped(forbidden: string, reason: string): Promise<void> {
    return new Promise<void>((done) => {
        const excludedDirs = [
            ".git",
            "node_modules",
            "dist",
            ".cache",
            ".parcel-cache",
            "assets",
            "vendor",
            ".idea/",
        ]

        const command =
            'grep -n "' +
            forbidden +
            '" -r . ' +
            excludedDirs.map((d) => "--exclude-dir=" + d).join(" ")
        console.log(command)
        exec(command, (error, stdout, stderr) => {
            if (error?.message?.startsWith("Command failed: grep")) {
                console.warn("Command failed!", error)
                throw error
            }
            if (error !== null) {
                throw error
            }
            if (stderr !== "") {
                throw stderr
            }

            const found = stdout
                .split("\n")
                .filter((s) => s !== "")
                .filter((s) => !s.startsWith("./test/"))
            if (found.length > 0) {
                const msg = `Found a '${forbidden}' at \n    ${found.join("\n     ")}.\n ${reason}`
                console.error(msg)
                console.error(found.length, "issues found")
                throw msg
            }
        })
    })
}

function wrap(promise: Promise<void>): (done: () => void) => void {
    return (done) => {
        promise.then(done)
    }
}

function validateScriptIntegrityOf(path: string) {
    const htmlContents = readFileSync(path, "utf8")
    const doc = parse_html(htmlContents)
    // @ts-ignore
    const scripts = Array.from(doc.getElementsByTagName("script"))
    for (const script of scripts) {
        const src = script.getAttribute("src")
        if (src === undefined) {
            continue
        }
        if (src.startsWith("./")) {
            // Local script - no check needed
            continue
        }
        const integrity = script.getAttribute("integrity")
        const ctx = "Script with source " + src + " in file " + path
        if (integrity === undefined) {
            throw new Error(ctx + " has no integrity value")
        }
        const crossorigin = script.getAttribute("crossorigin")
        if (crossorigin !== "anonymous") {
            throw new Error(ctx + " has crossorigin missing or not set to 'anonymous'")
        }
    }
}

describe("Code quality", () => {
    it(
        "should not contain reverse",
        detectInCode(
            "reverse()",
            "Reverse is stateful and changes the source list. This often causes subtle bugs"
        )
    )

    it(
        "should not contain 'constructor.name'",
        detectInCode("constructor\\.name", "This is not allowed, as minification does erase names.")
    )

    it(
        "should not contain 'innerText'",
        detectInCode(
            "innerText",
            "innerText is not allowed as it is not testable with fakeDom. Use 'textContent' instead."
        )
    )

    it("scripts with external sources should have an integrity hash", () => {
        const htmlFiles = ScriptUtils.readDirRecSync(".", 1).filter((f) => f.endsWith(".html"))
        for (const htmlFile of htmlFiles) {
            validateScriptIntegrityOf(htmlFile)
        }
    })
    /*
  itAsync(
      "should not contain 'import * as name from \"xyz.json\"'",
      detectInCode(
          'import \\* as [a-zA-Z0-9_]\\+ from \\"[.-_/a-zA-Z0-9]\\+\\.json\\"',
          "With vite, json files have a default export. Use import name from file.json instead"
      )
  )
/*
  itAsync(
      "should not contain '[\"default\"]'",
      detectInCode('\\[\\"default\\"\\]', "Possible leftover of faulty default import")
  )*/
})
