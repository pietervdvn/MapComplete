import { exec } from "child_process"
import { describe, expect, it, test } from "vitest"
import { webcrypto } from "node:crypto"
import { parse as parse_html } from "node-html-parser"
import { readFileSync } from "fs"
import ScriptUtils from "../scripts/ScriptUtils"

function detectInCode(forbidden: string, reason: string) {
    return wrap(detectInCodeUnwrapped(forbidden, reason))
}

/**
 *
 * @param forbidden a GREP-regex. This means that '.' is a wildcard and should be escaped to match a literal dot
 * @param reason
 * @private
 */
function detectInCodeUnwrapped(forbidden: string, reason: string): Promise<void> {
    return new Promise<void>(() => {
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

function _arrayBufferToBase64(buffer) {
    var binary = ""
    var bytes = new Uint8Array(buffer)
    var len = bytes.byteLength
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
}

const cachedHashes: Record<string, string> = {}

async function validateScriptIntegrityOf(path: string): Promise<void> {
    const htmlContents = readFileSync(path, "utf8")
    const doc = parse_html(htmlContents)
    // @ts-ignore
    const scripts = Array.from(doc.getElementsByTagName("script"))
    // Maps source URL onto hash
    const failed = new Set<string>()
    for (const script of scripts) {
        let src = script.getAttribute("src")
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
        if (src.startsWith("//")) {
            src = "https:" + src
        }
        if (cachedHashes[src] === undefined) {
            // Using 'scriptUtils' actually fetches data from the internet, it is not prohibited by the testHooks
            const data: string = (await ScriptUtils.Download(src))["content"]
            const hashed = await webcrypto.subtle.digest("SHA-384", new TextEncoder().encode(data))
            cachedHashes[src] = _arrayBufferToBase64(hashed)
        }
        const hashedStr = cachedHashes[src]

        const expected = "sha384-" + hashedStr
        if (expected !== integrity) {
            const msg =
                "Loading a script from '" +
                src +
                "' in the file " +
                path +
                " has a mismatched checksum: expected " +
                expected +
                " but the HTML-file contains " +
                integrity
            failed.add(msg)
            console.warn(msg)
        }
    }
    expect(Array.from(failed).join("\n")).to.equal("")
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

    test("scripts with external sources should have an integrity hash", async () => {
        const htmlFiles = ScriptUtils.readDirRecSync(".", 1).filter((f) => f.endsWith(".html"))
        for (const htmlFile of htmlFiles) {
            await validateScriptIntegrityOf(htmlFile)
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
