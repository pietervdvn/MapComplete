/**
 * The statistics-gui shows statistics from previous MapComplete-edits
 */
import {UIEventSource} from "../Logic/UIEventSource";
import {VariableUiElement} from "./Base/VariableUIElement";
import ChartJs from "./Base/ChartJs";
import Loading from "./Base/Loading";
import {Utils} from "../Utils";
import Combine from "./Base/Combine";

export default class StatisticsGUI {
    
    public static setup(): void{


        new VariableUiElement(index.map(paths => {
            if (paths === undefined) {
                return new Loading("Loading overview...")
            }
            const downloaded = new UIEventSource<{ features: ChangeSetData[] }[]>([])

            for (const filepath of paths) {
                Utils.downloadJson(homeUrl + filepath).then(data => {
                    downloaded.data.push(data)
                    downloaded.ping()
                })
            }

            return new VariableUiElement(downloaded.map(downloaded => {
                const themeBreakdown = new Map<string, number>()
                for (const feats of downloaded) {
                    console.log("Feats:", feats)
                    for (const feat of feats.features) {
                        const key = feat.properties.metadata.theme
                        const count = themeBreakdown.get(key) ?? 0
                        themeBreakdown.set(key, count + 1)
                    }
                }

                const keys = Array.from(themeBreakdown.keys())
                const values = keys.map( k => themeBreakdown.get(k))

                console.log(keys, values)
                return new Combine([
                    "Got " + downloaded.length + " files out of " + paths.length,
                    new ChartJs({
                        type: "pie",
                        data: {
                            datasets: [{data: values}],
                            labels: keys
                        }
                    }).SetClass("w-1/3 h-full")
                ]).SetClass("block w-full h-full")
            })).SetClass("block w-full h-full")
        })).SetClass("block w-full h-full").AttachTo("maindiv")

    }
    
}

const homeUrl = "https://raw.githubusercontent.com/pietervdvn/MapComplete/develop/Docs/Tools/stats/"
const stats_files = "file-overview.json"
const index = UIEventSource.FromPromise(Utils.downloadJson(homeUrl + stats_files))


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
