import { readFileSync, writeFileSync } from "fs"
import { Utils } from "../Utils"

function main(args: string[]) {
    console.log("File Merge")

    if (args.length != 3) {
        console.log("Usage: input1.json input2.json output.json")
        console.log("You passed in the arguments: " + args.join(","))
        return
    }
    const [input1, input2, output] = args
    const f1 = JSON.parse(readFileSync(input1, "utf8"))
    const f2 = JSON.parse(readFileSync(input2, "utf8"))
    Utils.Merge(f1, f2)
    writeFileSync(output, JSON.stringify(f2, null, "  "))
}

main(process.argv.slice(2))
