import { parse } from "csv-parse/sync"
import { readFileSync, writeFileSync } from "fs"
import { Utils } from "../../Utils"
import { GeoJSONObject, geometry } from "@turf/turf"

function parseAndClean(filename: string): Record<any, string>[] {
    const csvOptions = {
        columns: true,
        skip_empty_lines: true,
        trim: true,
    }
    const records: Record<any, string>[] = parse(readFileSync(filename), csvOptions)
    return records.map((r) => {
        for (const key of Object.keys(r)) {
            if (r[key].endsWith("niet van toepassing")) {
                delete r[key]
            }
        }

        return r
    })
}

const structuren = {
    "Voltijds Gewoon Secundair Onderwijs": "secondary",
    "Gewoon Lager Onderwijs": "primary",
    "Gewoon Kleuteronderwijs": "kindergarten",
    Kleuteronderwijs: "kindergarten",
    "Buitengewoon Lager Onderwijs": "primary",
    "Buitengewoon Secundair Onderwijs": "secondary",
    "Buitengewoon Kleuteronderwijs": "kindergarten",
    "Deeltijds Beroepssecundair Onderwijs": "secondary",
}

const degreesMapping = {
    "Derde graad": "upper_secondary",
    "Tweede graad": "middle_secondary",
    "Eerste graad": "lower_secondary",
}
const classificationOrder = [
    "kindergarten",
    "primary",
    "secondary",
    "lower_secondary",
    "middle_secondary",
    "upper_secondary",
]

const stelselsMapping = {
    "Beide stelsels": "linear_courses;modular_courses",
    "Lineair stelsel": "linear_courses",
    "Modulair stelsel": "modular_courses",
}

const rmKeys = [
    "schoolnummer",
    "instellingstype",
    "adres",
    "begindatum",
    "hoofdzetel",
    "huisnummer",
    "kbo-nummer",
    "beheerder(s)",
    "bestuur",
    "clb",
    "ingerichte hoofdstructuren",
    "busnummer",
    "crab-code",
    "crab-huisnr",
    "einddatum",
    "fax",
    "gemeente",
    "intern_vplnummer",
    "kbo_nummer",
    "lx",
    "ly",
    "niscode",
    "onderwijsniveau",
    "onderwijsvorm",
    "scholengemeenschap",
    "postcode",
    "provincie",
    "provinciecode",
    "soort instelling",
    "status erkenning",
    "straat",
    "VWO-vestigingsplaatscode",
    "taalstelsel",
    "net",
]

const rename = {
    "e-mail": "email",
    naam: "name",
    telefoon: "phone",
}

function fuzzIdenticals(features: { geometry: { coordinates: [number, number] } }[]) {
    var seen = new Set<string>()
    for (const feature of features) {
        var coors = feature.geometry.coordinates
        let k = coors[0] + "," + coors[1]
        while (seen.has(k)) {
            coors[0] += 0.00025
            k = coors[0] + "," + coors[1]
        }
        seen.add(k)
    }
}

/**
 * Sorts classifications in order
 *
 * sortClassifications(["primary","secondary","kindergarten"] // => ["kindergarten", "primary", "secondary"]
 */
function sortClassifications(classification: string[]) {
    return classification.sort(
        (a, b) => classificationOrder.indexOf(a) - classificationOrder.indexOf(b)
    )
}

function main() {
    console.log("Parsing schools...")
    const aantallen = "/home/pietervdvn/Downloads/Scholen/aantallen.csv"
    const perSchool = "/home/pietervdvn/Downloads/Scholen/perschool.csv"

    const schoolfields = [
        "schoolnummer",
        "intern_vplnummer",
        "net",
        "naam",
        "hoofdzetel",
        "adres",
        "straat",
        "huisnummer",
        "busnummer",
        "postcode",
        "gemeente",
        "niscode",
        "provinciecode",
        "provincie",
        "VWO-vestigingsplaatscode",
        "crab-code",
        "crab-huisnr",
        "lx",
        "ly",
        "kbo-nummer",
        "telefoon",
        "fax",
        "e-mail",
        "website",
        "beheerder(s)",
        "soort instelling",
        "onderwijsniveau",
        "instellingstype",
        "begindatum",
        "einddatum",
        "status erkenning",
        "clb",
        "bestuur",
        "scholengemeenschap",
        "taalstelsel",
        "ingerichte hoofdstructuren",
    ] as const

    const schoolGeojson: {
        features: {
            properties: Record<typeof schoolfields[number], string>
            geometry: {
                type: "Point"
                coordinates: [number, number]
            }
        }[]
    } = JSON.parse(readFileSync("scripts/schools/scholen.geojson", "utf8"))

    fuzzIdenticals(schoolGeojson.features)

    const aantallenFields = [
        "schooljaar",
        "nr koepel",
        "koepel",
        "instellingscode",
        "intern volgnr vpl",
        "volgnr vpl",
        "naam instelling",
        "GON-school",
        "GOK-school",
        "instellingsnummer scholengemeenschap",
        "scholengemeenschap",
        "code schoolbestuur",
        "schoolbestuur",
        "type vestigingsplaats",
        "fusiegemeente hoofdvestigingsplaats",
        "straatnaam vestigingsplaats",
        "huisnr vestigingsplaats",
        "bus vestigingsplaats",
        "postcode vestigingsplaats",
        "deelgemeente vestigingsplaats",
        "fusiegemeente vestigingsplaats",
        "hoofdstructuur (code)",
        "hoofdstructuur",
        "administratieve groep (code)",
        "administratieve groep",
        "graad lager onderwijs",
        "pedagogische methode",
        "graad secundair onderwijs",
        "leerjaar",
        "A of B-stroom",
        "basisopties",
        "beroepenveld",
        "onderwijsvorm",
        "studiegebied",
        "studierichting",
        "stelsel",
        "okan cluster",
        "type buitengewoon onderwijs",
        "opleidingsvorm (code)",
        "opleidingsvorm",
        "fase",
        "opleidingen",
        "geslacht",
        "aantal inschrijvingen",
    ] as const
    const aantallenParsed: Record<typeof aantallenFields[number], string>[] =
        parseAndClean(aantallen)
    const perschoolFields = [
        "schooljaar",
        "nr koepel",
        "koepel",
        "instellingscode",
        "naam instelling",
        "straatnaam",
        "huisnr",
        "bus",
        "postcode",
        "deelgemeente",
        "fusiegemeente",
        "aantal inschrijvingen",
    ] as const
    const perschoolParsed: Record<typeof perschoolFields[number], string>[] =
        parseAndClean(perSchool)

    schoolGeojson.features = schoolGeojson.features
        .filter((sch) => sch.properties.lx != "0" && sch.properties.ly != "0")
        .filter((sch) => sch.properties.instellingstype !== "Universiteit")

    const c = schoolGeojson.features.length
    console.log("Got ", schoolGeojson.features.length, "items after filtering")
    let i = 0
    let lastWrite = 0
    for (const feature of schoolGeojson.features) {
        i++
        const now = Date.now()
        if (now - lastWrite > 1000) {
            lastWrite = now
            console.log("Processing " + i + "/" + c)
        }
        const props = feature.properties

        const aantallen = aantallenParsed.filter((i) => i.instellingscode == props.schoolnummer)

        if (aantallen.length > 0) {
            const fetch = (key: typeof aantallenFields[number]) =>
                Utils.NoNull(Utils.Dedup(aantallen.map((x) => x[key])))

            props["onderwijsvorm"] = fetch("onderwijsvorm").join(";")

            /*
            const gonSchool = aantallen.some(x => x["GON-school"] === "GON-school")
            const gokSchool = aantallen.some(x => x["GOK-school"] === "GON-school")
            const onderwijsvorm = fetch("onderwijsvorm")
            const koepel = fetch("koepel")
            const stelsel = fetch("stelsel").join(";")
            const scholengemeenschap = fetch("scholengemeenschap")
            
            */
            const hoofdstructuur = fetch("hoofdstructuur")

            let specialEducation = false
            let classification = hoofdstructuur.map((s) => {
                const v = structuren[s]
                if (s.startsWith("Buitengewoon")) {
                    specialEducation = true
                }
                if (v === undefined) {
                    console.error("Type not found: " + s)
                    return ""
                }
                return v
            })
            const graden = fetch("graad secundair onderwijs")
            if (classification[0] === "secondary") {
                if (graden.length !== 3) {
                    classification = graden.map((degree) => degreesMapping[degree])
                }
            }
            sortClassifications(classification)
            props["school"] = Utils.Dedup(classification).join("; ")

            // props["koepel"] = koepel.join(";")
            // props["scholengemeenschap"] = scholengemeenschap.join(";")
            // props["stelsel"] = stelselsMapping[stelsel]

            if (specialEducation) {
                props["school:for"] = "special_education"
            }
            if (props.taalstelsel === "Nederlandstalig") {
                props["language:nl"] = "yes"
            }

            if (props.instellingstype === "Instelling voor deeltijds kunstonderwijs") {
                props["amenity"] = "college"
                props["school:subject"] = "art"
            }
        }

        const schoolinfo = perschoolParsed.filter((i) => i.instellingscode == props.schoolnummer)
        if (schoolinfo.length == 0) {
            // pass
        } else if (schoolinfo.length == 1) {
            props["capacity"] = schoolinfo[0]["aantal inschrijvingen"]
                .split(";")
                .map((i) => Number(i))
                .reduce((sum, i) => sum + i, 0)
        } else {
            throw "Multiple schoolinfo's found for " + props.schoolnummer
        }

        //props["source:ref"] = props.schoolnummer
        props["amenity"] = "school"
        if (props["school"] === "kindergarten") {
            props["amenity"] = "kindergarten"
            props["isced:2011:level"] = "early_education"
            delete props["school"]
        }

        for (const renameKey in rename) {
            const into = rename[renameKey]
            if (props[renameKey] !== undefined) {
                props[into] = props[renameKey]
                delete props[renameKey]
            }
        }

        for (const rmKey of rmKeys) {
            delete props[rmKey]
        }
    }

    //schoolGeojson.features = schoolGeojson.features.filter(f => f.properties["capacity"] !== undefined)
    /*schoolGeojson.features.forEach((f, i) => {
        f.properties["id"] = "school/"+i
    })*/
    schoolGeojson.features = schoolGeojson.features.filter(
        (f) => f.properties["amenity"] === "kindergarten"
    )

    writeFileSync("scripts/schools/amended_schools.geojson", JSON.stringify(schoolGeojson), "utf8")
    console.log("Done")
}

if (!process.argv[1].endsWith("mocha")) {
    main()
}
