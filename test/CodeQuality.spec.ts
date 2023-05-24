import { exec } from "child_process"
import { describe, it } from "vitest"

/**
 *
 * @param forbidden: a GREP-regex. This means that '.' is a wildcard and should be escaped to match a literal dot
 * @param reason
 * @private
 */
function detectInCode(forbidden: string, reason: string): Promise<void> {
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

        exec(
            'grep -n "' +
                forbidden +
                '" -r . ' +
                excludedDirs.map((d) => "--exclude-dir=" + d).join(" "),
            (error, stdout, stderr) => {
                if (error?.message?.startsWith("Command failed: grep")) {
                    console.warn("Command failed!", error)
                    return
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
                    const msg = `Found a '${forbidden}' at \n    ${found.join(
                        "\n     "
                    )}.\n ${reason}`
                    console.error(msg)
                    console.error(found.length, "issues found")
                    throw msg
                }
            }
        )
    })
}

function wrap(promise: Promise<void>): ((done: () => void) => void) {
    return (done => {
        promise.then(done)
    })
}

function itAsync(name: string, promise: Promise<void>){
    it(name, wrap(promise))
}

describe("Code quality", () => {
    itAsync(
        "should not contain reverse",
        detectInCode(
            "reverse()",
            "Reverse is stateful and changes the source list. This often causes subtle bugs"
        )
    )

    itAsync(
        "should not contain 'constructor.name'",
        detectInCode("constructor\\.name", "This is not allowed, as minification does erase names.")
    )

    itAsync(
        "should not contain 'innerText'",
        detectInCode(
            "innerText",
            "innerText is not allowed as it is not testable with fakeDom. Use 'textContent' instead."
        )
    )

    itAsync(
        "should not contain 'import * as name from \"xyz.json\"'",
        detectInCode(
            'import \\* as [a-zA-Z0-9_]\\+ from \\"[.-_/a-zA-Z0-9]\\+\\.json\\"',
            "With vite, json files have a default export. Use import name from file.json instead"
        )
    )

    itAsync(
        "should not contain '[\"default\"]'",
        detectInCode('\\[\\"default\\"\\]', "Possible leftover of faulty default import")
    )
})
