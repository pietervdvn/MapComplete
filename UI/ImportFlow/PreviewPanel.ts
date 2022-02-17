import Combine from "../Base/Combine";
import {UIEventSource} from "../../Logic/UIEventSource";
import UserRelatedState from "../../Logic/State/UserRelatedState";
import Translations from "../i18n/Translations";
import {Utils} from "../../Utils";
import {FlowStep} from "./FlowStep";
import Title from "../Base/Title";
import BaseUIElement from "../BaseUIElement";
import Histogram from "../BigComponents/Histogram";
import Toggleable from "../Base/Toggleable";
import List from "../Base/List";
import CheckBoxes from "../Input/Checkboxes";

/**
 * Shows the data to import on a map, asks for the correct layer to be selected
 */
export class PreviewPanel extends Combine implements FlowStep<{ features: { properties: any, geometry: { coordinates: [number, number] } }[] }> {
    public readonly IsValid: UIEventSource<boolean>;
    public readonly Value: UIEventSource<{ features: { properties: any, geometry: { coordinates: [number, number] } }[] }>

    constructor(
        state: UserRelatedState,
        geojson: { features: { properties: any, geometry: { coordinates: [number, number] } }[] }) {
        const t = Translations.t.importHelper;
        
        const propertyKeys = new Set<string>()
        for (const f of geojson.features) {
            Object.keys(f.properties).forEach(key => propertyKeys.add(key))
        }

        const attributeOverview: BaseUIElement[] = []

        const n = geojson.features.length;
        for (const key of Array.from(propertyKeys)) {

            const values = Utils.NoNull(geojson.features.map(f => f.properties[key]))
            const allSame = !values.some(v => v !== values[0])
            let countSummary: BaseUIElement
            if (values.length === n) {
                countSummary = t.allAttributesSame
            } else {
                countSummary = t.someHaveSame.Subs({
                    count: values.length,
                    percentage: Math.floor(100 * values.length / n)
                })
            }
            if (allSame) {
                attributeOverview.push(new Title(key + "=" + values[0]))
                attributeOverview.push(countSummary)
                continue
            }

            const uniqueCount = new Set(values).size
            if (uniqueCount !== values.length && uniqueCount < 15) {
                attributeOverview.push()
                // There are some overlapping values: histogram time!
                let hist: BaseUIElement =
                    new Combine([
                        countSummary,
                        new Histogram(
                            new UIEventSource<string[]>(values),
                            "Value",
                            "Occurence",
                            {
                                sortMode: "count-rev"
                            })
                    ]).SetClass("flex flex-col")


                const title = new Title(key + "=*")
                if (uniqueCount > 15) {
                    hist = new Toggleable(title,
                        hist.SetClass("block")
                    ).Collapse()

                } else {
                    attributeOverview.push(title)
                }

                attributeOverview.push(hist)
                continue
            }

            // All values are different or too much unique values, we add a boring (but collapsable) list
            attributeOverview.push(new Toggleable(
                new Title(key + "=*"),
                new Combine([
                    countSummary,
                    new List(values)
                ])
            ))

        }

        const confirm = new CheckBoxes([t.inspectLooksCorrect])

        super([
            new Title(t.inspectDataTitle.Subs({count: geojson.features.length})),
            "Extra remark: An attribute with 'source' or 'src' will be added as 'source' into the map pin; an attribute 'note' will be added into the map pin as well. These values won't be imported",
            ...attributeOverview,
            confirm
        ]);

        this.Value = new UIEventSource<{ features: { properties: any; geometry: { coordinates: [number, number] } }[] }>(geojson)
        this.IsValid = confirm.GetValue().map(selected => selected.length == 1)

    }
}