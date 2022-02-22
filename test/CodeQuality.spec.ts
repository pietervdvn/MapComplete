import T from "./TestHelper";
import {exec} from "child_process";

export default class CodeQualitySpec extends T {

    constructor() {
        super([
            [
                "no constructor.name in compiled code", () => {
                CodeQualitySpec.detectInCode("constructor\\.name", "This is not allowed, as minification does erase names.")
            }],
            [
                "no reverse in compiled code", () => {
                CodeQualitySpec.detectInCode("reverse()", "Reverse is stateful and changes the source list. This often causes subtle bugs")
            }]
        ]);
    }

    /**
     * 
     * @param forbidden: a GREP-regex. This means that '.' is a wildcard and should be escaped to match a literal dot
     * @param reason
     * @private
     */
    private static detectInCode(forbidden: string, reason: string) {

        const excludedDirs = [".git", "node_modules", "dist", ".cache", ".parcel-cache", "assets"]

        exec("grep -n \"" + forbidden + "\" -r . " + excludedDirs.map(d => "--exclude-dir=" + d).join(" "), ((error, stdout, stderr) => {
            if (error?.message?.startsWith("Command failed: grep")) {
                console.warn("Command failed!")
                return;
            }
            if (error !== null) {
                throw error

            }
            if (stderr !== "") {
                throw stderr
            }

            const found = stdout.split("\n").filter(s => s !== "").filter(s => !s.startsWith("./test/"));
            if (found.length > 0) {
                throw `Found a '${forbidden}' at \n    ${found.join("\n     ")}.\n ${reason}`
            }

        }))
    }
}