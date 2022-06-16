import {parse} from 'csv-parse/sync';
import {readFileSync, writeFileSync} from "fs";
import {Utils} from "../../Utils";

function parseAndClean(filename: string): Record<any, string>[] {
    const csvOptions = {
        columns: true,
        skip_empty_lines: true,
        trim: true
    }
    const records: Record<any, string>[] = parse(readFileSync(filename), csvOptions)
    return records.map(r => {

        for (const key of Object.keys(r)) {
            if (r[key].endsWith("niet van toepassing")) {
                delete r[key]
            }
        }

        return r;
    })
}

const structuren = {
    "Voltijds Gewoon Secundair Onderwijs": "secondary",
    "Gewoon Lager Onderwijs": "primary",
    "Gewoon Kleuteronderwijs": "kindergarten",
    "Kleuteronderwijs": "kindergarten",
    "Buitengewoon Lager Onderwijs": "primary",
    "Buitengewoon Secundair Onderwijs": "secondary",
    "Buitengewoon Kleuteronderwijs": "kindergarten",
    "Deeltijds Beroepssecundair Onderwijs": "secondary"

}

const rmKeys = ["schoolnummer", "instellingstype",
    "adres", "begindatum","hoofdzetel","huisnummer","kbo-nummer",
    "beheerder(s)", "bestuur", "clb", "ingerichte hoofdstructuren", "busnummer", "crab-code", "crab-huisnr", 
    "einddatum", "fax", "gemeente", "intern_vplnummer", "kbo_nummer", "lx", "ly", "niscode", 
    "onderwijsniveau","onderwijsvorm","scholengemeenschap",
    "postcode", "provincie",
    "provinciecode", "soort instelling", "status erkenning", "straat", "VWO-vestigingsplaatscode", "taalstelsel",
"net"]

const rename = {
    "e-mail":"email",
    "naam":"name",
    "telefoon":"phone"
    
}

function main() {
    const aantallen = "/home/pietervdvn/Downloads/Scholen/aantallen.csv"
    const perSchool = "/home/pietervdvn/Downloads/Scholen/perschool.csv"

    const schoolfields = ["schoolnummer", "intern_vplnummer", "net", "naam", "hoofdzetel", "adres", "straat", "huisnummer", "busnummer", "postcode", "gemeente", "niscode", "provinciecode", "provincie", "VWO-vestigingsplaatscode", "crab-code", "crab-huisnr", "lx", "ly", "kbo-nummer", "telefoon", "fax", "e-mail", "website", "beheerder(s)", "soort instelling", "onderwijsniveau", "instellingstype", "begindatum", "einddatum", "status erkenning", "clb", "bestuur", "scholengemeenschap", "taalstelsel", "ingerichte hoofdstructuren"] as const

    const schoolGeojson: {
        features: {
            properties: Record<(typeof schoolfields)[number], string>
        }[]
    } = JSON.parse(readFileSync("scholen.geojson", "utf8"))

    const aantallenFields = ["schooljaar", "nr koepel", "koepel", "instellingscode", "intern volgnr vpl", "volgnr vpl", "naam instelling", "GON-school", "GOK-school", "instellingsnummer scholengemeenschap", "scholengemeenschap", "code schoolbestuur", "schoolbestuur", "type vestigingsplaats", "fusiegemeente hoofdvestigingsplaats", "straatnaam vestigingsplaats", "huisnr vestigingsplaats", "bus vestigingsplaats", "postcode vestigingsplaats", "deelgemeente vestigingsplaats", "fusiegemeente vestigingsplaats", "hoofdstructuur (code)", "hoofdstructuur", "administratieve groep (code)", "administratieve groep", "graad lager onderwijs", "pedagogische methode", "graad secundair onderwijs", "leerjaar", "A of B-stroom", "basisopties", "beroepenveld", "onderwijsvorm", "studiegebied", "studierichting", "stelsel", "okan cluster", "type buitengewoon onderwijs", "opleidingsvorm (code)", "opleidingsvorm", "fase", "opleidingen", "geslacht", "aantal inschrijvingen"] as const
    const aantallenParsed: Record<(typeof aantallenFields)[number], string>[] = parseAndClean(aantallen)
    const perschoolFields = ["schooljaar", "nr koepel", "koepel", "instellingscode", "naam instelling", "straatnaam", "huisnr", "bus", "postcode", "deelgemeente", "fusiegemeente", "aantal inschrijvingen"] as const
    const perschoolParsed: Record<(typeof perschoolFields)[number], string>[] = parseAndClean(perSchool)

    schoolGeojson.features = schoolGeojson.features
        .filter(sch => sch.properties.lx != "0" && sch.properties.ly != "0")
        .filter(sch => sch.properties.instellingstype !== "Universiteit")

    for (const feature of schoolGeojson.features) {

        const props = feature.properties
        
        const aantallen = aantallenParsed.filter(i => i.instellingscode == props.schoolnummer)

        if (aantallen.length > 0) {

            const fetch = (key: (typeof aantallenFields)[number]) => Utils.NoNull(Utils.Dedup(aantallen.map(x => x[key])))

            props["onderwijsvorm"] = fetch("onderwijsvorm").join(";")

            const gonSchool = aantallen.some(x => x["GON-school"] === "GON-school")
            const gokSchool = aantallen.some(x => x["GOK-school"] === "GON-school")
            const hoofdstructuur = fetch("hoofdstructuur")
            const onderwijsvorm = fetch("onderwijsvorm")
            const koepel = fetch("koepel")
            const stelsel = fetch("stelsel")
            const scholengemeenschap = fetch("scholengemeenschap")
            const graden =fetch("graad secundair onderwijs")
            graden.sort()
            let specialEducation = false
            const classification = hoofdstructuur.map(s => {
                const v = structuren[s]
                if (s.startsWith("Buitengewoon")) {
                    specialEducation = true;
                }
                if (v === undefined) {
                    console.error("Type not found: " + s)
                    return ""
                }
                return v
            })
            props["school"] = Utils.Dedup(classification).join("; ")
            props["degrees"] = graden.join(";")
            props["koepel"] = koepel.join(";")
            props["scholengemeenschap"] = scholengemeenschap.join(";")
            props["stelsel"] = stelsel
            if (specialEducation) {
                props["school:for"] = "special_education"
            }
            if (props.taalstelsel === "Nederlandstalig") {
                props["language:nl"] = "yes"
            }
            
            if(props.instellingstype === "Instelling voor deeltijds kunstonderwijs") {
                props["amenity"] = "college"    
                props["school:subject"] = "art"
            }
        }

        const schoolinfo = perschoolParsed.filter(i => i.instellingscode == props.schoolnummer)
        if (schoolinfo.length == 0) {
            // pass
        } else if (schoolinfo.length == 1) {
            props["capacity"] = schoolinfo[0]["aantal inschrijvingen"].split(";").map(i => Number(i)).reduce((sum, i) => sum + i, 0)
        } else {
            throw "Multiple schoolinfo's found for " + props.schoolnummer
        }
        
        props["source:ref"] = props.schoolnummer

        for (const renameKey in rename) {
            const into = rename[renameKey]
            if(props[renameKey] !== undefined){
                props[into] = props[renameKey]
                delete props[renameKey]
            }
        }
        
        for (const rmKey of rmKeys) {
            delete props[rmKey]
        }

    }
    writeFileSync("amended_schools.geojson", JSON.stringify(schoolGeojson), "utf8")

}

main()