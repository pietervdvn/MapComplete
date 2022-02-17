import {existsSync, readdirSync, readFileSync, writeFileSync} from "fs";
import ScriptUtils from "../../scripts/ScriptUtils";
import {Utils} from "../../Utils";
import {exec} from "child_process"
import {GeoOperations} from "../../Logic/GeoOperations";

ScriptUtils.fixUtils()

class StatsDownloader {

    private readonly startYear = 2020
    private readonly startMonth = 5;
    private readonly urlTemplate = "https://osmcha.org/api/v1/changesets/?date__gte={start_date}&date__lte={end_date}&page={page}&editor=mapcomplete&page_size=100"
    private readonly _targetDirectory: string;


    constructor(targetDirectory = ".") {
        this._targetDirectory = targetDirectory;
    }

    public async DownloadStats() {

        const currentYear = new Date().getFullYear()
        const currentMonth = new Date().getMonth() + 1
        for (let year = this.startYear; year <= currentYear; year++) {
            for (let month = 1; month <= 12; month++) {

                if (year === this.startYear && month < this.startMonth) {
                    continue;
                }

                if (year === currentYear && month > currentMonth) {
                    continue
                }

                const path = `${this._targetDirectory}/stats.${year}-${month}.json`
                if (existsSync(path)) {
                    if ((month == currentMonth && year == currentYear)) {
                        console.log(`Force downloading ${year}-${month}`)
                    } else {
                        console.log(`Skipping ${year}-${month}: already exists`)
                        continue;
                    }
                }
                await this.DownloadStatsForMonth(year, month, path)
            }
        }

    }

    public async DownloadStatsForMonth(year: number, month: number, path: string) {

        let page = 1;
        let allFeatures = []
        let endDate = `${year}-${Utils.TwoDigits(month + 1)}-01`
        if (month == 12) {
            endDate = `${year + 1}-01-01`
        }
        let url = this.urlTemplate.replace("{start_date}", year + "-" + Utils.TwoDigits(month) + "-01")
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
            ScriptUtils.erasableLog(`Downloading stats for ${year}-${month}, page ${page} ${url}`)
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
            f.properties.id = f.id
        })
        writeFileSync(path, JSON.stringify({
            features: allFeatures
        }, undefined, 2))
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

const theme_remappings = {
    "metamap": "maps",
    "groen": "buurtnatuur",
    "updaten van metadata met mapcomplete": "buurtnatuur",
    "Toevoegen of dit natuurreservaat toegangkelijk is": "buurtnatuur",
    "wiki:mapcomplete/fritures": "fritures",
    "wiki:MapComplete/Fritures": "fritures",
    "lits": "lit",
    "pomp": "cyclofix",
    "wiki:user:joost_schouppe/campersite": "campersite",
    "wiki-user-joost_schouppe-geveltuintjes": "geveltuintjes",
    "wiki-user-joost_schouppe-campersite": "campersite",
    "wiki-User-joost_schouppe-campersite": "campersite",
    "wiki-User-joost_schouppe-geveltuintjes": "geveltuintjes",
    "wiki:User:joost_schouppe/campersite": "campersite",
    "arbres": "arbres_llefia",
    "aed_brugge": "aed",
    "https://llefia.org/arbres/mapcomplete.json": "arbres_llefia",
    "https://llefia.org/arbres/mapcomplete1.json": "arbres_llefia",
    "toevoegen of dit natuurreservaat toegangkelijk is": "buurtnatuur",
    "testing mapcomplete 0.0.0": "buurtnatuur",
    "https://raw.githubusercontent.com/osmbe/play/master/mapcomplete/geveltuinen/geveltuinen.json": "geveltuintjes"
}

class ChangesetDataTools {

    public static cleanChangesetData(cs: ChangeSetData): ChangeSetData {
        if (cs.properties.metadata.theme === undefined) {
            cs.properties.metadata.theme = cs.properties.comment.substr(cs.properties.comment.lastIndexOf("#") + 1)
        }
        cs.properties.metadata.theme = cs.properties.metadata.theme.toLowerCase()
        const remapped = theme_remappings[cs.properties.metadata.theme]
        cs.properties.metadata.theme = remapped ?? cs.properties.metadata.theme
        if (cs.properties.metadata.theme.startsWith("https://raw.githubusercontent.com/")) {
            cs.properties.metadata.theme = "gh://" + cs.properties.metadata.theme.substr("https://raw.githubusercontent.com/".length)
        }
        if (cs.properties.modify + cs.properties.delete + cs.properties.create == 0) {
            cs.properties.metadata.theme = "EMPTY CS"
        }
        return cs
    }

}

interface PlotSpec {
    name: string,
    interpetKeysAs: "date" | "number" | "string" | string
    plot: {
        type: "pie" | "bar" | "line"
        count: { key: string, value: number }[]
    } | {
        type: "stacked-bar"
        count: {
            label: string,
            values: { key: string | Date, value: number }[]
        }[]
    },

    render()
}


function createGraph(
    title: string,
    ...options: PlotSpec[]) {
    console.log("Creating graph",title,"...")
    const process = exec("python3 GenPlot.py \"graphs/" + title + "\"", ((error, stdout, stderr) => {
        console.log("Python: ", stdout)
        if (error !== null) {
            console.error(error)
        }
        if (stderr !== "") {
            console.error(stderr)
        }
    }))

    for (const option of options) {
        const d = JSON.stringify(option) + "\n"
        process.stdin._write(d, "utf-8", undefined)
    }
    process.stdin._write("\n", "utf-8", undefined)

}

class Histogram<K> {
    public counts: Map<K, number> = new Map<K, number>()
    private sortAtEnd: K[] = []

    constructor(keys?: K[]) {
        const self = this
        keys?.forEach(key => self.bump(key))
    }

    total(): number {
        let total = 0
        Array.from(this.counts.values()).forEach(i => total = total + i)
        return total
    }

    public bump(key: K, increase = 1) {

        if (this.counts.has(key)) {
            this.counts.set(key, increase + this.counts.get(key))
        } else {
            this.counts.set(key, increase)
        }
    }

    /**
     * Adds all the values of the given histogram to this histogram
     * @param hist
     */
    public bumpHist(hist: Histogram<K>) {
        const self = this
        hist.counts.forEach((value, key) => {
            self.bump(key, value)
        })
    }

    /**
     * Creates a new histogram. All entries with less then 'cutoff' count are lumped together into the 'other' category
     */
    public createOthersCategory(otherName: K, cutoff: number | ((key: K, value: number) => boolean) = 15): Histogram<K> {
        const hist = new Histogram<K>()
        hist.sortAtEnd.push(otherName)

        if (typeof cutoff === "number") {
            this.counts.forEach((value, key) => {
                if (value <= cutoff) {
                    hist.bump(otherName, value)
                } else {
                    hist.bump(key, value)
                }
            })
        } else {
            this.counts.forEach((value, key) => {
                if (cutoff(key, value)) {
                    hist.bump(otherName, value)
                } else {
                    hist.bump(key, value)
                }
            })
        }

        return hist;
    }

    public addCountToName(): Histogram<string> {
        const self = this;
        const hist = new Histogram<string>()
        hist.sortAtEnd = this.sortAtEnd.map(name => `${name} (${self.counts.get(name)})`)

        this.counts.forEach((value, key) => {
            hist.bump(`${key} (${value})`, value)
        })

        return hist;
    }

    public Clone(): Histogram<K> {
        const hist = new Histogram<K>()
        hist.bumpHist(this)
        hist.sortAtEnd = [...this.sortAtEnd];
        return hist;
    }

    public keyToDate(addMissingDays: boolean = false): Histogram<Date> {
        const hist = new Histogram<Date>()
        hist.sortAtEnd = this.sortAtEnd.map(name => new Date("" + name))

        let earliest = undefined;
        let latest = undefined;
        this.counts.forEach((value, key) => {
            const d = new Date("" + key);
            if (earliest === undefined) {
                earliest = d
            } else if (d < earliest) {
                earliest = d
            }
            if (latest === undefined) {
                latest = d
            } else if (d > latest) {
                latest = d
            }
            hist.bump(d, value)
        })

        if (addMissingDays) {
            while (earliest < latest) {
                earliest.setDate(earliest.getDate() + 1)
                hist.bump(earliest, 0)
            }
        }
        return hist
    }

    public asRunningAverages(convertToRange: ((key: K) => K[])) {
        const newCount = new Histogram<K>()
        const self = this
        this.counts.forEach((_, key) => {
            const keysToCheck = convertToRange(key)
            let sum = 0
            for (const k of keysToCheck) {
                sum += self.counts.get(k) ?? 0
            }
            newCount.bump(key, sum / keysToCheck.length)
        })
        return newCount
    }

    /**
     * Given a histogram:
     * 'a': 3
     * 'b': 5
     * 'c': 3
     * 'd': 1
     *
     * This will create a new histogram, which counts how much every count occurs, thus:
     * 5: 1  // as only 'b' had 5 counts
     * 3: 2  // as both 'a' and 'c' had 3 counts
     * 1: 1 // as only 'd' has 1 count
     */
    public binPerCount(): Histogram<number> {
        const hist = new Histogram<number>()
        this.counts.forEach((value) => {
            hist.bump(value)
        })
        return hist;
    }

    public stringifyName(): Histogram<string> {
        const hist = new Histogram<string>()
        this.counts.forEach((value, key) => {
            hist.bump("" + key, value)
        })
        return hist;
    }

    public asPie(options: {
        name: string
        compare?: (a: K, b: K) => number
    }): PlotSpec {
        const self = this
        const entriesArray = Array.from(this.counts.entries())
        let type: string = (typeof entriesArray[0][0])
        if (entriesArray[0][0] instanceof Date) {
            type = "date"
        }
        const entries = entriesArray.map(kv => {
            return ({key: kv[0], value: kv[1]});
        })

        if (options.compare) {
            entries.sort((a, b) => options.compare(a.key, b.key))
        } else {
            entries.sort((a, b) => b.value - a.value)
        }
        entries.sort((a, b) => self.sortAtEnd.indexOf(a.key) - self.sortAtEnd.indexOf(b.key))


        const graph: PlotSpec = {
            name: options.name,
            interpetKeysAs: type,
            plot: {

                type: "pie",
                count: entries.map(kv => {
                    if (kv.key instanceof Date) {
                        return ({key: kv.key.toISOString(), value: kv.value})
                    }
                    return ({key: kv.key + "", value: kv.value});
                })
            },
            render: undefined
        }
        graph.render = () => createGraph(graph.name, graph)
        return graph;
    }

    public asBar(options: {
        name: string
        compare?: (a: K, b: K) => number
    }): PlotSpec {
        const spec = this.asPie(options)
        spec.plot.type = "bar"
        return spec;
    }

    public asLine(options: {
        name: string
        compare?: (a: K, b: K) => number
    }) {
        const spec = this.asPie(options)
        spec.plot.type = "line"
        return spec
    }

}

class Group<K, V> {

    public groups: Map<K, V[]> = new Map<K, V[]>()

    constructor(features?: any[], fkey?: (feature: any) => K, fvalue?: (feature: any) => V) {
        const self = this;
        features?.forEach(f => {
            self.bump(fkey(f), fvalue(f))
        })
    }

    public static createStackedBarChartPerDay(name: string, features: any, extractV: (feature: any) => string, minNeededTotal = 1): void {
        const perDay = new Group<string, string>(
            features,
            f => f.properties.date.substr(0, 10),
            extractV
        )

        createGraph(
            name,
            ...Array.from(
                stackHists<string, string>(
                    perDay.asGroupedHists()
                        .filter(tpl => tpl[1].total() > minNeededTotal)
                        .map(tpl => [`${tpl[0]} (${tpl[1].total()})`, tpl[1]])
                )
            )
                .map(
                    tpl => {
                        const [name, hist] = tpl
                        return hist
                            .keyToDate(true)
                            .asBar({
                                name: name
                            });
                    }
                )
        )
    }

    public bump(key: K, value: V) {
        if (!this.groups.has(key)) {
            this.groups.set(key, [])
        }
        this.groups.get(key).push(value)
    }

    public asHist(dedup = false): Histogram<K> {
        const hist = new Histogram<K>()
        this.groups.forEach((values, key) => {
            if (dedup) {
                hist.bump(key, new Set(values).size)
            } else {
                hist.bump(key, values.length)
            }
        })
        return hist
    }

    asGroupedHists(): [V, Histogram<K>][] {

        const allHists = new Map<V, Histogram<K>>()

        const allValues = new Set<V>();
        Array.from(this.groups.values()).forEach(vs =>
            vs.forEach(v => {
                allValues.add(v)
            })
        )

        allValues.forEach(v => allHists.set(v, new Histogram<K>()))

        this.groups.forEach((values, key) => {
            values.forEach(v => {
                allHists.get(v).bump(key)
            })
        })

        return Array.from(allHists.entries())
    }
}

function stackHists<K, V>(hists: [V, Histogram<K>][]): [V, Histogram<K>][] {
    const runningTotals = new Histogram<K>()
    const result: [V, Histogram<K>][] = []
    hists.forEach(vhist => {
        const hist = vhist[1]
        const clone = hist.Clone()
        clone.bumpHist(runningTotals)
        runningTotals.bumpHist(hist)
        result.push([vhist[0], clone])
    })
    result.reverse()
    return result
}


function createGraphs(allFeatures: ChangeSetData[], appliedFilterDescription: string) {
    const hist = new Histogram<string>(allFeatures.map(f => f.properties.metadata.theme))
    hist
        .createOthersCategory("other", 20)
        .addCountToName()
        .asBar({name: "Changesets per theme (bar)" + appliedFilterDescription})
    .render()


    new Histogram<string>(allFeatures.map(f => f.properties.user))
        .binPerCount()
        .stringifyName()
        .createOthersCategory("25 or more", (key, _) => Number(key) >= 25).asBar(
        {
            compare: (a, b) => Number(a) - Number(b),
            name: "Contributors per changeset count" + appliedFilterDescription
        })
    .render()


    const csPerDay = new Histogram<string>(allFeatures.map(f => f.properties.date.substr(0, 10)))

    const perDayLine = csPerDay
        .keyToDate()
        .asLine({
            compare: (a, b) => a.getTime() - b.getTime(),
            name: "Changesets per day" + appliedFilterDescription
        })

    const perDayAvg = csPerDay.asRunningAverages(key => {
        const keys = []
        for (let i = 0; i < 7; i++) {
            const otherDay = new Date(new Date(key).getTime() - i * 1000 * 60 * 60 * 24)
            keys.push(otherDay.toISOString().substr(0, 10))
        }
        return keys
    })
        .keyToDate()
        .asLine({
        compare: (a, b) => a.getTime() - b.getTime(),
        name: "Rolling 7 day average" + appliedFilterDescription
    })
    
    const perDayAvgMonth = csPerDay.asRunningAverages(key => {
        const keys = []
        for (let i = 0; i < 31; i++) {
            const otherDay = new Date(new Date(key).getTime() - i * 1000 * 60 * 60 * 24)
            keys.push(otherDay.toISOString().substr(0, 10))
        }
        return keys
    })
        .keyToDate()
        .asLine({
        compare: (a, b) => a.getTime() - b.getTime(),
        name: "Rolling 31 day average" + appliedFilterDescription
    })
    
    createGraph("Changesets per day (line)" + appliedFilterDescription, perDayLine, perDayAvg, perDayAvgMonth)

    new Histogram<string>(allFeatures.map(f => f.properties.metadata.host))
        .asPie({
            name: "Changesets per host" + appliedFilterDescription
        }).render()

    new Histogram<string>(allFeatures.map(f => f.properties.metadata.theme))
        .createOthersCategory("< 25 changesets", 25)
        .addCountToName()
        .asPie({
            name: "Changesets per theme (pie)" + appliedFilterDescription
        }).render()

    Group.createStackedBarChartPerDay(
        "Changesets per theme" + appliedFilterDescription,
        allFeatures,
        f => f.properties.metadata.theme,
        25
    )

    Group.createStackedBarChartPerDay(
        "Changesets per version number" + appliedFilterDescription,
        allFeatures,
        f => f.properties.editor.substr("MapComplete ".length, 6).replace(/[a-zA-Z-/]/g, ''),
        1
    )
    
    Group.createStackedBarChartPerDay(
        "Changesets per minor version number" + appliedFilterDescription,
        allFeatures,
        f => {
        	const base = f.properties.editor.substr("MapComplete ".length).replace(/[a-zA-Z-/]/g, '')
        	const [major, minor, patch] = base.split(".")
        	return major+"."+minor
        
        },
        1
    )

    Group.createStackedBarChartPerDay(
        "Deletion-changesets per theme" + appliedFilterDescription,
        allFeatures.filter(f => f.properties.delete > 0),
        f => f.properties.metadata.theme,
        1
    )

    {
        // Contributors (unique + unique new) per day
        const contributorCountPerDay = new Group<string, string>()
        const newContributorsPerDay = new Group<string, string>()
        const seenContributors = new Set<string>()
        allFeatures.forEach(f => {
            const user = f.properties.user
            const day = f.properties.date.substr(0, 10)
            contributorCountPerDay.bump(day, user)
            if (!seenContributors.has(user)) {
                seenContributors.add(user)
                newContributorsPerDay.bump(day, user)
            }
        })
        const total = new Set(allFeatures.map(f => f.properties.user)).size
        createGraph(
            `Contributors per day${appliedFilterDescription}`,
            contributorCountPerDay
                .asHist(true)
                .keyToDate(true)
                .asBar({
                    name: `Unique contributors per day (${total} total)`
                }),
            newContributorsPerDay
                .asHist(true)
                .keyToDate(true)
                .asBar({
                    name: "New, unique contributors per day"
                }),
        )


    }


}

function createMiscGraphs(allFeatures: ChangeSetData[], emptyCS: ChangeSetData[]) {
    new Histogram(emptyCS.map(f => f.properties.date)).keyToDate().asBar({
        name: "Empty changesets by date"
    }).render()
    const geojson = {
        type: "FeatureCollection",
        features: Utils.NoNull(allFeatures
            .map(f => {
                try {
                    const point = GeoOperations.centerpoint(f.geometry);
                    point.properties = {...f.properties, ...f.properties.metadata}
                    delete point.properties.metadata
                    for (const key in f.properties.metadata) {
                        point.properties[key] = f.properties.metadata[key]
                    }
                    
                    return point
                } catch (e) {
                    console.error("Could not create center point: ", e, f)
                    return undefined
                }
        }))
    }
    writeFileSync("centerpoints.geojson", JSON.stringify(geojson, undefined, 2))
}

async function main(): Promise<void>{
    await new StatsDownloader("stats").DownloadStats()
    const allPaths = readdirSync("stats")
        .filter(p => p.startsWith("stats.") && p.endsWith(".json"));
    let allFeatures: ChangeSetData[] = [].concat(...allPaths
        .map(path => JSON.parse(readFileSync("stats/" + path, "utf-8")).features
            .map(cs => ChangesetDataTools.cleanChangesetData(cs))));

    const emptyCS = allFeatures.filter(f => f.properties.metadata.theme === "EMPTY CS")
    allFeatures = allFeatures.filter(f => f.properties.metadata.theme !== "EMPTY CS")

    createMiscGraphs(allFeatures, emptyCS)
    createGraphs(allFeatures, "")
    // createGraphs(allFeatures.filter(f => f.properties.date.startsWith("2020")), " in 2020")
    // createGraphs(allFeatures.filter(f => f.properties.date.startsWith("2021")), " in 2021")
    createGraphs(allFeatures.filter(f => f.properties.date.startsWith("2022")), " in 2022")
}

main().then(_ => console.log("All done!"))

