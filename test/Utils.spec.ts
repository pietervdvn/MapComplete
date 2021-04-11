import T from "./TestHelper";
import {Utils} from "../Utils";
import {equal} from "assert";
import {existsSync, mkdirSync, readFileSync, writeFile, writeFileSync} from "fs";
import LZString from "lz-string";
new T("Utils",[
    ["Minify-json",() => {
        const str = JSON.stringify({title: "abc", "and":"xyz", "render":"somevalue"}, null, 0);
        const minified = Utils.MinifyJSON(str);
        console.log(minified)
        console.log("Minified version has ", minified.length, "chars")
        const restored = Utils.UnMinify(minified)
        console.log(restored)
        console.log("Restored version has ", restored.length, "chars")
        equal(str, restored)

    }],
    ["Minify-json of the bookcases",() => {
        let str = readFileSync("/home/pietervdvn/git/MapComplete/assets/layers/public_bookcases/public_bookcases.json", "UTF8")
        str = JSON.stringify(JSON.parse(str), null, 0)
        const minified = Utils.MinifyJSON(str);
        console.log("Minified version has ", minified.length, "chars")
        const restored = Utils.UnMinify(minified)
        console.log("Restored version has ", restored.length, "chars")
        equal(str, restored)

    }],
    ["Minify-json with LZ-string of the bookcases",() => {
        let str = readFileSync("/home/pietervdvn/git/MapComplete/assets/layers/public_bookcases/public_bookcases.json", "UTF8")
        str = JSON.stringify(JSON.parse(str), null, 0)
        const minified =LZString.compressToBase64(Utils.MinifyJSON(str));
        console.log("Minified version has ", minified.length, "chars")
        const restored = Utils.UnMinify(LZString.decompressFromBase64(minified))
        console.log("Restored version has ", restored.length, "chars")
        equal(str, restored)

    }],
    ["Minify-json with only LZ-string of the bookcases",() => {
        let str = readFileSync("/home/pietervdvn/git/MapComplete/assets/layers/public_bookcases/public_bookcases.json", "UTF8")
        str = JSON.stringify(JSON.parse(str), null, 0)
        const minified =LZString.compressToBase64(str);
        console.log("Minified version has ", minified.length, "chars")
        const restored = LZString.decompressFromBase64(minified)
        console.log("Restored version has ", restored.length, "chars")
        equal(str, restored)

    }]
    
    
])