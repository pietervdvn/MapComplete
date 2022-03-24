import Combine from "../Base/Combine";
import {UIEventSource} from "../../Logic/UIEventSource";
import Translations from "../i18n/Translations";
import {SubtleButton} from "../Base/SubtleButton";
import {VariableUiElement} from "../Base/VariableUIElement";
import Title from "../Base/Title";
import InputElementMap from "../Input/InputElementMap";
import BaseUIElement from "../BaseUIElement";
import FileSelectorButton from "../Input/FileSelectorButton";
import {FlowStep} from "./FlowStep";
import {parse} from "papaparse";
import {FixedUiElement} from "../Base/FixedUiElement";

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
export class RequestFile extends Combine implements FlowStep<{features: any[]}> {

    public readonly IsValid: UIEventSource<boolean>
    /**
     * The loaded GeoJSON
     */
    public readonly Value: UIEventSource<{features: any[]}>

    constructor() {
        const t = Translations.t.importHelper.selectFile;
        const csvSelector = new FileSelector(new SubtleButton(undefined, t.description))
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

        const asGeoJson: UIEventSource<any | { error: string | BaseUIElement }> = text.map(src => {
            if (src === undefined) {
                return undefined
            }
            try {
                const parsed = JSON.parse(src)
                if (parsed["type"] !== "FeatureCollection") {
                    return {error: t.errNotFeatureCollection}
                }
                if (parsed.features.some(f => f.geometry.type != "Point")) {
                    return {error: t.errPointsOnly}
                }
                return parsed;

            } catch (e) {
                // Loading as CSV
                var lines: string[][] = <any>parse(src).data;
                const header = lines[0]
                lines.splice(0, 1)
                if (header.indexOf("lat") < 0 || header.indexOf("lon") < 0) {
                    return {error: t.errNoLatOrLon}
                }

                if (header.some(h => h.trim() == "")) {
                    return {error: t.errNoName}
                }


                if (new Set(header).size !== header.length) {
                    return {error: t.errDuplicate}
                }


                const features = []
                for (let i = 0; i < lines.length; i++) {
                    const attrs = lines[i];
                    if (attrs.length == 0 || (attrs.length == 1 && attrs[0] == "")) {
                        // empty line
                        continue
                    }
                    const properties = {}
                    for (let i = 0; i < header.length; i++) {
                        const v = attrs[i]
                        if (v === undefined || v === "") {
                            continue
                        }
                        properties[header[i]] = v;
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
            let err: BaseUIElement;
            if(typeof v.error === "string"){
                err = new FixedUiElement(v.error)
            }else if(v.error.Clone !== undefined){
                err = v.error.Clone()
            }else{
                err = v.error
            }
            return err.SetClass("alert");
        }))

        super([

            new Title(t.title, 1),
            t.fileFormatDescription,
            t.fileFormatDescriptionCsv,
            t.fileFormatDescriptionGeoJson,
            csvSelector,
            loadedFiles,
            errorIndicator

        ]);
        this.SetClass("flex flex-col wi")
        this.IsValid = asGeoJson.map(geojson => geojson !== undefined && geojson["error"] === undefined)
        this.Value = asGeoJson
    }


}