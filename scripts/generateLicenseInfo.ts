import {Utils} from "../Utils";
import {lstatSync, readdirSync, readFileSync, writeFileSync, unlinkSync, existsSync, mkdir, mkdirSync} from "fs";
import SmallLicense from "../Models/smallLicense";
import ScriptUtils from "./ScriptUtils";

Utils.runningFromConsole = true;

/**
 * Sweeps the entire 'assets/' (except assets/generated) directory for image files and any 'license_info.json'-file.
 * Checks that the license info is included for each of them and generates a compiles license_info.json for those
 */

function generateLicenseInfos(paths: string[]): SmallLicense[] {
    const licenses = []
    for (const path of paths) {
        try {


            const parsed = JSON.parse(readFileSync(path, "UTF-8"))
            if (Array.isArray(parsed)) {
                const l: SmallLicense[] = parsed
                for (const smallLicens of l) {
                    smallLicens.path = path.substring(0, path.length - "license_info.json".length) + smallLicens.path
                }
                licenses.push(...l)
            } else {
                const smallLicens: SmallLicense = parsed;
                /*if(parsed.license === "CC-BY"){
                    console.log("Rewriting ", path)
                    parsed.license === "CC-BY 4.0"
                    writeFileSync(path, JSON.stringify(smallLicens, null, "  "))
                }*/

                smallLicens.path = path.substring(0, 1 + path.lastIndexOf("/")) + smallLicens.path
                licenses.push(smallLicens)
            }
        } catch (e) {
            console.error("Error: ", e, "while handling", path)
        }

    }
    return licenses
}

function missingLicenseInfos(licenseInfos: SmallLicense[], allIcons: string[]) {
    const missing = []

    const knownPaths = new Set<string>()
    for (const licenseInfo of licenseInfos) {
        knownPaths.add(licenseInfo.path)
    }

    for (const iconPath of allIcons) {
        if (iconPath.indexOf("license_info.json") >= 0) {
            continue;
        }
        if (knownPaths.has(iconPath)) {
            continue;
        }
        missing.push(iconPath)
    }
    return missing;
}

const prompt = require('prompt-sync')();

const knownLicenses = new Map<string, SmallLicense>()
knownLicenses.set("cf", {
    authors: ["Pieter Fiers", "Thibault Declercq", "Pierre Barban", "Joost Schouppe", "Pieter Vander Vennet"],
    path: undefined,
    license: "CC-BY-SA",
    sources: ["https://osoc.be/editions/2020/cyclofix"]
})
knownLicenses.set("me", {
    authors: ["Pieter Vander Vennet"],
    path: undefined,
    license: "CC0",
    sources: []
})

knownLicenses.set("t", {
    authors: [],
    path: undefined,
    license: "CC0; trivial",
    sources: []
})

knownLicenses.set("na", {
    authors: [],
    path: undefined,
    license: "CC0",
    sources: []
})

knownLicenses.set("chrn", {
    authors: ["Christian Neumann"],
    path: undefined,
    license: "CC-BY-SA 3.0",
    sources: ["https://utopicode.de/", "https://github.com/chrneumann/MapComplete"]
})

knownLicenses.set("klimaan", {
    authors: ["Klimaan VZW"],
    path: undefined,
    license: "CC-BY-SA 3.0",
    sources: ["https://klimaan.be/"]
})

function promptLicenseFor(path): SmallLicense {
    console.log("License abbreviations:")
    knownLicenses.forEach((value, key) => {
        console.log(key, " => ", value)
    })
    const author = prompt("What is the author for artwork " + path + "? (or: [Q]uit, [S]kip)  > ")
    path = path.substring(path.lastIndexOf("/") + 1)

    if (knownLicenses.has(author)) {
        const license = knownLicenses.get(author);
        license.path = path;
        return license;
    }

    if (author == "s") {
        return null;
    }
    if (author == "Q" || author == "q" || author == "") {
        throw "Quitting now!"
    }
    let authors = author.split(";")
    if (author.toLowerCase() == "none") {
        authors = []
    }
    return {
        authors: author.split(";"),
        path: path,
        license: prompt("What is the license for artwork " + path + "?  > "),
        sources: prompt("Where was this artwork found?  > ").split(";")
    }
}

function createLicenseInfoFor(path): void {
    const li = promptLicenseFor(path);
    if (li == null) {
        return;
    }
    writeFileSync(path + ".license_info.json", JSON.stringify(li, null, "  "))
}

function cleanLicenseInfo(allPaths: string[], allLicenseInfos: SmallLicense[]) {
    // Read the license info file from the generated assets, creates a compiled license info in every directory
    // Note: this removes all the old license infos
    for (const licensePath of licensePaths) {
        unlinkSync(licensePath)
    }

    const perDirectory = new Map<string, SmallLicense[]>()

    for (const license of allLicenseInfos) {
        const p = license.path
        const dir = p.substring(0, p.lastIndexOf("/"))
        license.path = p.substring(dir.length + 1)
        if (!perDirectory.has(dir)) {
            perDirectory.set(dir, [])
        }
        perDirectory.get(dir).push(license)
    }

    perDirectory.forEach((licenses, dir) => {
        writeFileSync(dir + "/license_info.json", JSON.stringify(licenses, null, 2))
    })

}

function queryMissingLicenses(missingLicenses: string[]) {
    process.on('SIGINT', function () {
        console.log("Aborting... Bye!");
        process.exit();
    });

    let i = 1;
    for (const missingLicens of missingLicenses) {
        console.log(i + " / " + missingLicenses.length)
        i++;
        if (i < missingLicenses.length - 5) {
            //    continue
        }
        createLicenseInfoFor(missingLicens)
    }

    console.log("You're through!")
}

console.log("Checking and compiling license info")
const contents = ScriptUtils.readDirRecSync("./assets")
    .filter(entry => entry.indexOf("./assets/generated") != 0)
const licensePaths = contents.filter(entry => entry.indexOf("license_info.json") >= 0)
const licenseInfos = generateLicenseInfos(licensePaths);

if (!existsSync("./assets/generated")) {
    mkdirSync("./assets/generated")
}

writeFileSync("./assets/generated/license_info.json", JSON.stringify(licenseInfos, null, "  "))

const artwork = contents.filter(pth => pth.match(/(.svg|.png|.jpg)$/i) != null)
const missingLicenses = missingLicenseInfos(licenseInfos, artwork)
const invalidLicenses = licenseInfos.filter(l => (l.license ?? "") === "").map(l => `License for artwork ${l.path} is empty string or undefined`)
for (const licenseInfo of licenseInfos) {
    for (const source of licenseInfo.sources) {
        if (source == "") {
            invalidLicenses.push("Invalid license: empty string in " + JSON.stringify(licenseInfo))
        }
        try {
            new URL(source);
        } catch {
            invalidLicenses.push("Not a valid URL: " + source)
        }
    }
}
if (process.argv.indexOf("--prompt") >= 0 || process.argv.indexOf("--query") >= 0) {
    queryMissingLicenses(missingLicenses)
}
if (missingLicenses.length > 0) {
    const msg = `There are ${missingLicenses.length} licenses missing and ${invalidLicenses.length} invalid licenses.`
    console.log(missingLicenses.concat(invalidLicenses).join("\n"))
    console.error(msg)
    if (process.argv.indexOf("--report") >= 0) {
        console.log("Writing report!")
        writeFileSync("missing_licenses.txt", missingLicenses.concat(invalidLicenses).join("\n"))
    }
    if (process.argv.indexOf("--no-fail") < 0) {
        throw msg
    }
}

cleanLicenseInfo(licensePaths, licenseInfos)
