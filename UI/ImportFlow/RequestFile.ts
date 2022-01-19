import Combine from "../Base/Combine";
import {UIEventSource} from "../../Logic/UIEventSource";
import Translations from "../i18n/Translations";
import {SubtleButton} from "../Base/SubtleButton";
import {VariableUiElement} from "../Base/VariableUIElement";
import {FixedUiElement} from "../Base/FixedUiElement";
import Title from "../Base/Title";
import InputElementMap from "../Input/InputElementMap";
import BaseUIElement from "../BaseUIElement";
import FileSelectorButton from "../Input/FileSelectorButton";
import {FlowStep} from "./FlowStep";

class FileSelector extends InputElementMap<FileList, { name: string, contents: Promise<string> }> {
    constructor(label: BaseUIElement) {
        super(
            new FileSelectorButton(label, {allowMultiple: false, acceptType: "*"}),
            (x0, x1) => {
                // Total hack: x1 is undefined is the backvalue - we effectively make this a one-way-story
                return x1 === undefined || x0 === x1;
            },
            filelist => {
                if (filelist === undefined) {
                    return undefined
                }
                const file = filelist.item(0)
                return {name: file.name, contents: file.text()}
            },
            _ => undefined
        )
    }
}

/**
 * The first step in the import flow: load a file and validate that it is a correct geojson or CSV file
 */
export class RequestFile extends Combine implements FlowStep<any> {

    public readonly IsValid: UIEventSource<boolean>
    /**
     * The loaded GeoJSON
     */
    public readonly Value: UIEventSource<any>

    constructor() {
        const t = Translations.t.importHelper;
        const csvSelector = new FileSelector(new SubtleButton(undefined, t.selectFile))
        const loadedFiles = new VariableUiElement(csvSelector.GetValue().map(file => {
            if (file === undefined) {
                return t.noFilesLoaded.SetClass("alert")
            }
            return t.loadedFilesAre.Subs({file: file.name}).SetClass("thanks")
        }))

        const text = UIEventSource.flatten(
            csvSelector.GetValue().map(v => {
                if (v === undefined) {
                    return undefined
                }
                return UIEventSource.FromPromise(v.contents)
            }))

        const asGeoJson: UIEventSource<any | { error: string }> = text.map(src => {
            if (src === undefined) {
                return undefined
            }
            try {
                const parsed = JSON.parse(src)
                if (parsed["type"] !== "FeatureCollection") {
                    return {error: "The loaded JSON-file is not a geojson-featurecollection"}
                }
                if (parsed.features.some(f => f.geometry.type != "Point")) {
                    return {error: "The loaded JSON-file should only contain points"}
                }
                return parsed;

            } catch (e) {
                // Loading as CSV
                const lines = src.split("\n")
                const header = lines[0].split(",")
                lines.splice(0, 1)
                if (header.indexOf("lat") < 0 || header.indexOf("lon") < 0) {
                    return {error: "The header does not contain `lat` or `lon`"}
                }

                const features = []
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    if (line.trim() === "") {
                        continue
                    }
                    const attrs = line.split(",")
                    const properties = {}
                    for (let i = 0; i < header.length; i++) {
                        properties[header[i]] = attrs[i];
                    }
                    const coordinates = [Number(properties["lon"]), Number(properties["lat"])]
                    delete properties["lat"]
                    delete properties["lon"]
                    if (coordinates.some(isNaN)) {
                        return {error: "A coordinate could not be parsed for line " + (i + 2)}
                    }
                    const f = {
                        type: "Feature",
                        properties,
                        geometry: {
                            type: "Point",
                            coordinates
                        }
                    };
                    features.push(f)
                }

                return {
                    type: "FeatureCollection",
                    features
                }
            }
        })


        const errorIndicator = new VariableUiElement(asGeoJson.map(v => {
            if (v === undefined) {
                return undefined;
            }
            if (v?.error === undefined) {
                return undefined;
            }
            return new FixedUiElement(v?.error).SetClass("alert");
        }))

        super([

            new Title(t.title, 1),
            t.description,
            csvSelector,
            loadedFiles,
            errorIndicator

        ]);
        this.IsValid = asGeoJson.map(geojson => geojson !== undefined && geojson["error"] === undefined)
        this.Value = asGeoJson
    }


}