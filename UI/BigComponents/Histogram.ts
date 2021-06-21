import {VariableUiElement} from "../Base/VariableUIElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import Table from "../Base/Table";
import Combine from "../Base/Combine";
import {FixedUiElement} from "../Base/FixedUiElement";
import {Utils} from "../../Utils";
import BaseUIElement from "../BaseUIElement";
import Translations from "../i18n/Translations";

export default class Histogram<T> extends VariableUiElement {

    private static defaultPalette = [
        "#ff5858",
        "#ffad48",
        "#ffff59",
        "#9d62d9",
        "#56bd56",
        "#63a9ff",
        "#fa61fa"
    ]

    constructor(values: UIEventSource<string[]>,
                title: string | BaseUIElement,
                countTitle: string | BaseUIElement,
                assignColor?: (t0: string) => string
    ) {
        super(values.map(values => {

            if (values === undefined) {
                return undefined;
            }

            values = Utils.NoNull(values)

            const counts = new Map<string, number>()
            for (const value of values) {
                const c = counts.get(value) ?? 0;
                counts.set(value, c + 1);
            }

            const keys = Array.from(counts.keys());
            keys.sort()
            
            const max = Math.max(...Array.from(counts.values()))

            const fallbackColor = (keyValue: string) => {
                const index = keys.indexOf(keyValue)
                return Histogram.defaultPalette[index % Histogram.defaultPalette.length]
            };
            let actualAssignColor = undefined;
            if (assignColor === undefined) {
                actualAssignColor = fallbackColor;
            }else{
                actualAssignColor = (keyValue: string) => {
                    return assignColor(keyValue) ?? fallbackColor(keyValue)
                }
            }

            return new Table(
                [Translations.W(title), countTitle],
                keys.map(key => [
                    key,
                    new Combine([
                    new Combine([new FixedUiElement("" + counts.get(key)).SetClass("font-bold rounded-full block")])
                            .SetClass("flex justify-center rounded border border-black")
                            .SetStyle(`background: ${actualAssignColor(key)}; width: ${100 * counts.get(key) / max}%`)
                    ]).SetClass("block w-full")

                ]),
                keys.map(_ => ["width: 20%"])
            ).SetClass("w-full");
        }));
    }
}