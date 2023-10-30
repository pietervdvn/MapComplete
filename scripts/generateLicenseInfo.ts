import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "fs"
import SmallLicense from "../src/Models/smallLicense"
import ScriptUtils from "./ScriptUtils"
import Script from "./Script"
import { Utils } from "../src/Utils"
const prompt = require("prompt-sync")()
export class GenerateLicenseInfo extends Script {
    private static readonly needsLicenseRef = new Set(
        ScriptUtils.readDirRecSync("./LICENSES")
            .map((p) => p.substring(p.lastIndexOf("/") + 1))
            .filter((p) => p.startsWith("LicenseRef-"))
            .map((p) => p.substring("LicenseRef-".length))
            .map((p) => p.substring(0, p.lastIndexOf(".")))
    )

    constructor() {
        super("Validates the licenses and compiles them into one single asset file")
    }

    static defaultLicenses() {
        const knownLicenses = new Map<string, SmallLicense>()
        knownLicenses.set("me", {
            authors: ["Pieter Vander Vennet"],
            path: undefined,
            license: "CC0",
            sources: [],
        })
        knownLicenses.set("streetcomplete", {
            authors: ["Tobias Zwick (westnordost)"],
            path: undefined,
            license: "CC0",
            sources: [
                "https://github.com/streetcomplete/StreetComplete/tree/master/res/graphics",
                "https://f-droid.org/packages/de.westnordost.streetcomplete/",
            ],
        })

        knownLicenses.set("temaki", {
            authors: ["Temaki"],
            path: undefined,
            license: "CC0",
            sources: [
                "https://github.com/ideditor/temaki",
                "https://ideditor.github.io/temaki/docs/",
            ],
        })

        knownLicenses.set("maki", {
            authors: ["Maki"],
            path: undefined,
            license: "CC0",
            sources: ["https://labs.mapbox.com/maki-icons/"],
        })

        knownLicenses.set("t", {
            authors: [],
            path: undefined,
            license: "CC0; trivial",
            sources: [],
        })
        knownLicenses.set("na", {
            authors: [],
            path: undefined,
            license: "CC0",
            sources: [],
        })
        knownLicenses.set("carto", {
            authors: ["OSM-Carto"],
            path: undefined,
            license: "CC0",
            sources: [""],
        })
        knownLicenses.set("tv", {
            authors: ["Toerisme Vlaanderen"],
            path: undefined,
            license: "CC0",
            sources: [
                "https://toerismevlaanderen.be/pinjepunt",
                "https://mapcomplete.org/toerisme_vlaanderenn",
            ],
        })
        knownLicenses.set("tvf", {
            authors: ["Jo De Baerdemaeker "],
            path: undefined,
            license: "All rights reserved",
            sources: ["https://www.studiotype.be/fonts/flandersart"],
        })
        knownLicenses.set("twemoji", {
            authors: ["Twemoji"],
            path: undefined,
            license: "CC-BY 4.0",
            sources: ["https://github.com/twitter/twemoji"],
        })
        return knownLicenses
    }

    validateLicenseInfo(l: SmallLicense) {
        l.sources.map((s) => {
            try {
                return new URL(s)
            } catch (e) {
                throw "Could not parse URL " + s + " for a license for " + l.path + " due to " + e
            }
        })
    }

    /**
     * Sweeps the entire 'assets/' (except assets/generated) directory for image files and any 'license_info.json'-file.
     * Checks that the license info is included for each of them and generates a compiles license_info.json for those
     */

    generateLicenseInfos(paths: string[]): SmallLicense[] {
        const licenses = []
        for (const path of paths) {
            try {
                const parsed = JSON.parse(readFileSync(path, { encoding: "utf8" }))
                if (Array.isArray(parsed)) {
                    const l: SmallLicense[] = parsed
                    for (const smallLicens of l) {
                        smallLicens.path =
                            path.substring(0, path.length - "license_info.json".length) +
                            smallLicens.path
                    }
                    licenses.push(...l)
                } else {
                    const smallLicens: SmallLicense = parsed
                    smallLicens.path =
                        path.substring(0, 1 + path.lastIndexOf("/")) + smallLicens.path
                    licenses.push(smallLicens)
                }
            } catch (e) {
                console.error("Error: ", e, "while handling", path)
            }
        }
        return licenses
    }

    missingLicenseInfos(licenseInfos: SmallLicense[], allIcons: string[]) {
        const missing = []

        const knownPaths = new Set<string>()
        for (const licenseInfo of licenseInfos) {
            knownPaths.add(licenseInfo.path)
        }

        for (const iconPath of allIcons) {
            if (iconPath.indexOf("license_info.json") >= 0) {
                continue
            }
            if (knownPaths.has(iconPath)) {
                continue
            }
            missing.push(iconPath)
        }
        return missing
    }

    promptLicenseFor(path): SmallLicense {
        const knownLicenses = GenerateLicenseInfo.defaultLicenses()
        console.log("License abbreviations:")
        knownLicenses.forEach((value, key) => {
            console.log(key, " => ", value)
        })
        const author = prompt(
            "What is the author for artwork " + path + "? (or: [Q]uit, [S]kip)  > "
        )
        path = path.substring(path.lastIndexOf("/") + 1)

        if (knownLicenses.has(author)) {
            const license = knownLicenses.get(author)
            license.path = path
            return license
        }

        if (author == "s") {
            return null
        }
        if (author == "Q" || author == "q" || author == "") {
            throw "Quitting now!"
        }
        return {
            authors: author.split(";"),
            path: path,
            license: prompt("What is the license for artwork " + path + "?  > "),
            sources: prompt("Where was this artwork found?  > ").split(";"),
        }
    }

    createLicenseInfoFor(path): void {
        const li = this.promptLicenseFor(path)
        if (li == null) {
            return
        }
        writeFileSync(path + ".license_info.json", JSON.stringify(li, null, "  "))
    }

    /**
     * Rewrites a license into a SPDX-valid-ID.
     * Might involve some guesswork (e.g. 'CC-BY-SA' --> 'CC-BY-SA 4.0"
     * @param licenseId
     */
    toSPDXCompliantLicense(licenseId: string): string {
        licenseId = licenseId.trim()
        // https://spdx.org/licenses/
        const mappings: Record<string, string> = {
            "CC-0": "CC0-1.0",
            CC0: "CC0-1.0",
            "CC-BY-4.0-INTERNATIONAL": "CC-BY-4.0",
            "CC-4.0": "CC-BY-4.0",
            "CC-BY": "CC-BY-4.0",
            "CC-BY-SA-4.0-INTERNATIONAL": "CC-BY-SA-4.0",
            "CC-BY-SA": "CC-BY-SA-4.0",
            "CREATIVE-COMMONS-4.0-BY-NC": "CC-BY-NC-4.0",
            "CC-BY-SA-3.0-UNPORTED": "CC-BY-SA-3.0",
            "ISC-LICENSE": "ISC",
            "LOGO-BY-THE-GOVERNMENT": "LOGO",
            PD: "PUBLIC-DOMAIN",
            "LOGO-(ALL-RIGHTS-RESERVED)": "LOGO",
            /*  ALL-RIGHTS-RESERVED:
            PD:
                PUBLIC-DOMAIN:
        TRIVIAL: //*/
        }

        return mappings[licenseId] ?? licenseId
    }

    cleanLicenseInfo(allPaths: string[], allLicenseInfos: SmallLicense[]) {
        // Read the license info file from the generated assets, creates a compiled license info in every directory
        // Note: this removes all the old license infos
        for (const licensePath of allPaths) {
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
            const cloned: SmallLicense = {
                // We make a clone to force the order of the keys
                path: license.path,
                license: license.license,
                authors: license.authors,
                sources: license.sources,
            }

            cloned.license = Utils.Dedup(
                cloned.license.split(";").map((l) => this.toSPDXCompliantLicense(l))
            ).join("; ")
            if (cloned.license === "CC0-1.0; TRIVIAL") {
                cloned.license = "TRIVIAL"
            }
            if (cloned.license === "LOGO; ALL-RIGHTS-RESERVED") {
                cloned.license = "LOGO"
            }
            cloned.license = cloned.license.split("; ").join(" AND ")

            perDirectory.get(dir).push(cloned)
        }

        perDirectory.forEach((licenses, dir) => {
            for (let i = licenses.length - 1; i >= 0; i--) {
                const license = licenses[i]
                const path = dir + "/" + license.path
                if (!existsSync(path)) {
                    console.log(
                        "Found license for now missing file: ",
                        path,
                        " - removing this license"
                    )
                    licenses.splice(i, 1)
                }
            }

            licenses.sort((a, b) => (a.path < b.path ? -1 : 1))
            const path = dir + "/license_info.json"
            if (licenses.length === 0) {
                console.log("Removing", path, "as it is empty")
                // No need to _actually_ unlik, this is done above
            } else {
                writeFileSync(path, JSON.stringify(licenses, null, 2))
            }
        })
    }

    queryMissingLicenses(missingLicenses: string[]) {
        process.on("SIGINT", function () {
            console.log("Aborting... Bye!")
            process.exit()
        })

        let i = 1
        for (const missingLicens of missingLicenses) {
            console.log(i + " / " + missingLicenses.length)
            i++
            if (i < missingLicenses.length - 5) {
                //    continue
            }
            this.createLicenseInfoFor(missingLicens)
        }

        console.log("You're through!")
    }

    /**
     * Creates the humongous license_info in the generated assets, containing all licenses with a path relative to the root
     * @param licensePaths
     */
    createFullLicenseOverview(licensePaths: string[]) {
        const allLicenses: SmallLicense[] = []
        for (const licensePath of licensePaths) {
            if (!existsSync(licensePath)) {
                continue
            }
            const licenses = <SmallLicense[]>(
                JSON.parse(readFileSync(licensePath, { encoding: "utf8" }))
            )
            for (const license of licenses) {
                this.validateLicenseInfo(license)
                const dir = licensePath.substring(
                    0,
                    licensePath.length - "license_info.json".length
                )
                license.path = dir + license.path
                allLicenses.push(license)
            }
        }

        writeFileSync(
            "./src/assets/generated/license_info.json",
            JSON.stringify(allLicenses, null, "  ")
        )
    }

    async main(args: string[]) {
        console.log("Checking and compiling license info")

        if (!existsSync("./src/assets/generated")) {
            mkdirSync("./src/assets/generated")
        }

        let contents = ScriptUtils.readDirRecSync("./assets").filter(
            (entry) => entry.indexOf("./assets/generated") != 0
        )
        let licensePaths = contents.filter((entry) => entry.indexOf("license_info.json") >= 0)
        let licenseInfos = this.generateLicenseInfos(licensePaths)

        const artwork = contents.filter(
            (pth) => pth.match(/(.svg|.png|.jpg|.ttf|.otf|.woff|.jpeg)$/i) != null
        )
        const missingLicenses = this.missingLicenseInfos(licenseInfos, artwork)
        if (args.indexOf("--prompt") >= 0 || args.indexOf("--query") >= 0) {
            this.queryMissingLicenses(missingLicenses)
            return this.main([])
        }

        const invalidLicenses = licenseInfos
            .filter((l) => (l.license ?? "") === "")
            .map((l) => `License for artwork ${l.path} is empty string or undefined`)

        let invalid = 0
        for (const licenseInfo of licenseInfos) {
            const isTrivial = licenseInfo.license
                .split(";")
                .map((l) => l.trim().toLowerCase())
                .some((s) => s.endsWith("trivial"))
            if (licenseInfo.sources.length + licenseInfo.authors.length == 0 && !isTrivial) {
                invalid++
                invalidLicenses.push(
                    "Invalid license: No sources nor authors given in the license for " +
                        JSON.stringify(licenseInfo)
                )
                continue
            }

            for (const source of licenseInfo.sources) {
                if (source == "") {
                    invalidLicenses.push(
                        "Invalid license: empty string in " + JSON.stringify(licenseInfo)
                    )
                }
                try {
                    new URL(source)
                } catch {
                    invalidLicenses.push("Not a valid URL: " + source)
                }
            }

            const spdxPath = licenseInfo.path + ".license"

            const spdxContent = [
                "SPDX-FileCopyrightText: " + licenseInfo.authors.join("; "),
                "SPDX-License-Identifier: " +
                    licenseInfo.license
                        .split(" AND ")
                        .map((s) => this.addLicenseRef(s))
                        .join(" AND "),
            ]
            writeFileSync(spdxPath, spdxContent.join("\n"))
        }

        if (missingLicenses.length > 0 || invalidLicenses.length) {
            const msg = `There are ${missingLicenses.length} licenses missing and ${invalidLicenses.length} invalid licenses.`
            console.log(missingLicenses.concat(invalidLicenses).join("\n"))
            console.error(msg)
            if (args.indexOf("--no-fail") < 0) {
                throw msg
            }
        }

        this.cleanLicenseInfo(licensePaths, licenseInfos)
        this.createFullLicenseOverview(licensePaths)
    }

    /**
     * Some licenses need "LicenseRef-" to be added to make reuse lint work
     * @param s
     * @private
     */
    private addLicenseRef(s: string): string {
        if (GenerateLicenseInfo.needsLicenseRef.has(s)) {
            console.log("Mapping ", s, Array.from(GenerateLicenseInfo.needsLicenseRef))
            return "LicenseRef-" + s
        }
        return s
    }
}

new GenerateLicenseInfo().run()
