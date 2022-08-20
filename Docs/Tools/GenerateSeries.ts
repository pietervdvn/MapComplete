import {existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync} from "fs";
import ScriptUtils from "../../scripts/ScriptUtils";
import {Utils} from "../../Utils";

ScriptUtils.fixUtils()

class StatsDownloader {

    private readonly urlTemplate = "https://osmcha.org/api/v1/changesets/?date__gte={start_date}&date__lte={end_date}&page={page}&comment=%23mapcomplete&page_size=100"

    private readonly _targetDirectory: string;

    constructor(targetDirectory = ".") {
        this._targetDirectory = targetDirectory;
    }

    public async DownloadStats(startYear = 2020, startMonth = 5) {

        const today = new Date();
        const currentYear = today.getFullYear()
        const currentMonth = today.getMonth() + 1
        for (let year = startYear; year <= currentYear; year++) {
            for (let month = 1; month <= 12; month++) {

                if (year === startYear && month < startMonth) {
                    continue;
                }

                if (year === currentYear && month > currentMonth) {
                    break
                }

                const pathM = `${this._targetDirectory}/stats.${year}-${month}.json`
                if (existsSync(pathM)) {
                    continue;
                }

                const features = []
                for (let day = 1; day <= 31; day++) {
                    
                    if (year === currentYear && month === currentMonth && day === today.getDate()) {
                        break;
                    }
                    {
                        const date = new Date(year, month - 1, day)
                        if(date.getMonth() != month -1){
                            // We did roll over
                            continue
                        }
                    }
                    const path = `${this._targetDirectory}/stats.${year}-${month}-${(day < 10 ? "0" : "") + day}.day.json`
                    if (existsSync(path)) {
                        features.push(...JSON.parse(readFileSync(path, "UTF-8")))
                        console.log("Loaded ", path, "from disk, got", features.length, "features now")
                        continue
                    }
                    let dayFeatures: any[] = undefined
                    try {
                        dayFeatures = await this.DownloadStatsForDay(year, month, day, path)
                    } catch (e) {
                        console.error(e)
                        console.error("Could not download " + year + "-" + month + "-" + day + "... Trying again")
                        dayFeatures = await this.DownloadStatsForDay(year, month, day, path)
                    }
                    writeFileSync(path, JSON.stringify(dayFeatures))
                    features.push(...dayFeatures)

                }
                writeFileSync(pathM, JSON.stringify({features}))
            }
        }

    }

    public async DownloadStatsForDay(year: number, month: number, day: number, path: string): Promise<any[]> {

        let page = 1;
        let allFeatures = []
        let endDay = new Date(year, month - 1 /* Zero-indexed: 0 = january*/, day + 1);
        let endDate = `${endDay.getFullYear()}-${Utils.TwoDigits(endDay.getMonth() + 1)}-${Utils.TwoDigits(endDay.getDate())}`
        let url = this.urlTemplate.replace("{start_date}", year + "-" + Utils.TwoDigits(month) + "-" + Utils.TwoDigits(day))
            .replace("{end_date}", endDate)
            .replace("{page}", "" + page)


        let headers = {
            'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:86.0) Gecko/20100101 Firefox/86.0',
            'Accept-Language': 'en-US,en;q=0.5',
            'Referer': 'https://osmcha.org/?filters=%7B%22date__gte%22%3A%5B%7B%22label%22%3A%222020-07-05%22%2C%22value%22%3A%222020-07-05%22%7D%5D%2C%22editor%22%3A%5B%7B%22label%22%3A%22mapcomplete%22%2C%22value%22%3A%22mapcomplete%22%7D%5D%7D',
            'Content-Type': 'application/json',
            'Authorization': 'Token 6e422e2afedb79ef66573982012000281f03dc91',
            'DNT': '1',
            'Connection': 'keep-alive',
            'TE': 'Trailers',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache'
        }


        while (url) {
            ScriptUtils.erasableLog(`Downloading stats for ${year}-${month}-${day}, page ${page} ${url}`)
            const result = await Utils.downloadJson(url, headers)
            page++;
            allFeatures.push(...result.features)
            if (result.features === undefined) {
                console.log("ERROR", result)
                return
            }
            url = result.next
        }
        console.log(`Writing ${allFeatures.length} features to `, path, Utils.Times(_ => " ", 80))
        allFeatures = Utils.NoNull(allFeatures)
        allFeatures.forEach(f => {
            f.properties = {...f.properties, ...f.properties.metadata}
            delete f.properties.metadata
            f.properties.id = f.id
        })
        return allFeatures
    }

}


interface ChangeSetData {
    "id": number,
    "type": "Feature",
    "geometry": {
        "type": "Polygon",
        "coordinates": [number, number][][]
    },
    "properties": {
        "check_user": null,
        "reasons": [],
        "tags": [],
        "features": [],
        "user": string,
        "uid": string,
        "editor": string,
        "comment": string,
        "comments_count": number,
        "source": string,
        "imagery_used": string,
        "date": string,
        "reviewed_features": [],
        "create": number,
        "modify": number,
        "delete": number,
        "area": number,
        "is_suspect": boolean,
        "harmful": any,
        "checked": boolean,
        "check_date": any,
        "metadata": {
            "host": string,
            "theme": string,
            "imagery": string,
            "language": string
        }
    }
}


async function main(): Promise<void> {
    if (!existsSync("graphs")) {
        mkdirSync("graphs")
    }

    const targetDir = "Docs/Tools/stats"
    let year = 2020
    let month = 5
    if(!isNaN(Number(process.argv[2]))){
        year = Number(process.argv[2])
    }
    if(!isNaN(Number(process.argv[3]))){
        month = Number(process.argv[3])
    }
    
    do {
        try {

            await new StatsDownloader(targetDir).DownloadStats(year, month)
            break
        } catch (e) {
            console.log(e)
        }

    } while (true)
    const allPaths = readdirSync(targetDir)
        .filter(p => p.startsWith("stats.") && p.endsWith(".json"));
    let allFeatures: ChangeSetData[] = [].concat(...allPaths
        .map(path => JSON.parse(readFileSync("Docs/Tools/stats/" + path, "utf-8")).features));
    allFeatures = allFeatures.filter(f => f?.properties !== undefined && (f.properties.editor === null || f.properties.editor.toLowerCase().startsWith("mapcomplete")))

    allFeatures = allFeatures.filter(f => f.properties.metadata.theme !== "EMPTY CS")

    const noEditor = allFeatures.filter(f => f.properties.editor === null).map(f => "https://www.osm.org/changeset/" + f.id)
    writeFileSync("missing_editor.json", JSON.stringify(noEditor, null, "  "));

    if (process.argv.indexOf("--no-graphs") >= 0) {
        return
    }
    const allFiles = readdirSync("Docs/Tools/stats").filter(p => p.endsWith(".json"))
    writeFileSync("Docs/Tools/stats/file-overview.json", JSON.stringify(allFiles))

}

main().then(_ => console.log("All done!"))

