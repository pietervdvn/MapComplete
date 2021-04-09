import {Utils} from "../Utils";
import {lstatSync, readdirSync, readFileSync, writeFileSync} from "fs";
import SmallLicense from "../Models/smallLicense";

Utils.runningFromConsole = true;

/**
 * Sweeps the entire 'assets/' (except assets/generated) directory for image files and any 'license_info.json'-file.
 * Checks that the license info is included for each of them and generates a compiles license_info.json for those
 */

function readDirRecSync(path): string[] {
    const result = []
    for (const entry of readdirSync(path)) {
        const fullEntry = path + "/" + entry
        const stats = lstatSync(fullEntry)
        if (stats.isDirectory()) {
            // Subdirectory
            // @ts-ignore
            result.push(...readDirRecSync(fullEntry))
        } else {
            result.push(fullEntry)
        }
    }
    return result;
}

function generateLicenseInfos(paths: string[]): SmallLicense[] {
    const licenses = []
    for (const path of paths) {
        const parsed = JSON.parse(readFileSync(path, "UTF-8"))
        if (Array.isArray(parsed)) {
            const l: SmallLicense[] = parsed
            for (const smallLicens of l) {
                smallLicens.path = path.substring(0, path.length - "license_info.json".length) + smallLicens.path
            }
            licenses.push(...l)
        } else {
            const smallLicens: SmallLicense = parsed;
            smallLicens.path = path.substring(0, 1 + path.lastIndexOf("/")) + smallLicens.path
            licenses.push(smallLicens)
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
    authors: ["Pieter Fiers", "Thibault Declercq", "Pierre Barban", "Joost Schouppe","Pieter Vander Vennet"],
    path: undefined,
    license: "CC-BY-SA",
    sources: ["https://osoc.be/editions/2020/cyclofix"]
})
knownLicenses.set("me", {
    authors: ["Pieter Vander Vennet"],
    path : undefined,
    license: "CC0",
    sources: []
})

knownLicenses.set("t", {
    authors: [],
    path : undefined,
    license: "CC0; trivial",
    sources: []
})

knownLicenses.set("na", {
    authors: [],
    path : undefined,
    license: "CC0",
    sources: []
})


function promptLicenseFor(path): SmallLicense {
    console.log("License abbreviations:")
    knownLicenses.forEach((value, key) => {
        console.log(key, " => ", value)
    })
    const author = prompt("What is the author for artwork " + path + "? (or: [Q]uit, [S]kip)  > ")
    path = path.substring(path.lastIndexOf("/") + 1)
 
    if(knownLicenses.has(author)){
        const license = knownLicenses.get(author);
        license.path = path;
        return license;
    }

    if(author == "s"){
        return null;
    }
    if (author == "Q" || author == "q" || author == "") {
        throw "Quitting now!"
    }
    let authors = author.split(";")
    if(author.toLowerCase() == "none"){
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
    if(li == null){
        return;
    }
    writeFileSync(path + ".license_info.json", JSON.stringify(li, null, "  "))
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

console.log("Checking and compiling license info")
const contents = readDirRecSync("./assets")
    .filter(entry => entry.indexOf("./assets/generated") != 0)
const licensePaths = contents.filter(entry => entry.indexOf("license_info.json") >= 0)
const licenseInfos = generateLicenseInfos(licensePaths);
writeFileSync("./assets/generated/license_info.json", JSON.stringify(licenseInfos, null, "  "))

const artwork = contents.filter(pth => pth.match(/(.svg|.png|.jpg)$/i) != null)
const missingLicenses = missingLicenseInfos(licenseInfos, artwork)

console.log(`There are ${missingLicenses.length} licenses missing.`, missingLicenses)

// shuffle(missingLicenses)

process.on('SIGINT', function() {
    console.log("Aborting... Bye!");
    process.exit();
});

let i = 1;
for (const missingLicens of missingLicenses) {
    console.log(i + " / " + missingLicenses.length)
    i++;
    if(i < missingLicenses.length - 5){
    //    continue
    }
    createLicenseInfoFor(missingLicens)
    
}