import T from "./TestHelper";
import {exec} from "child_process";

export default class CodeQualitySpec extends T {
    constructor() {
        super([
            [
                "no constructor.name in compiled code", () => {

                const excludedDirs = [".git", "node_modules", "dist", ".cache", ".parcel-cache", "assets"]

                exec("grep \"constructor.name\" -r . " + excludedDirs.map(d => "--exclude-dir=" + d).join(" "), ((error, stdout, stderr) => {
                    if (error?.message?.startsWith("Command failed: grep")) {
                        return;
                    }
                    if (error !== null) {
                        throw error

                    }
                    if (stderr !== "") {
                        throw stderr
                    }

                    const found = stdout.split("\n").filter(s => s !== "").filter(s => s.startsWith("test/"));
                    if (found.length > 0) {
                        throw "Found a 'constructor.name' at " + found.join(", ") + ". This is not allowed, as minification does erase names."
                    }

                }))

            }
            ]
        ]);
    }
}