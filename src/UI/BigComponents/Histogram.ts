import { VariableUiElement } from "../Base/VariableUIElement"
import { Store, UIEventSource } from "../../Logic/UIEventSource"
import Table from "../Base/Table"
import Combine from "../Base/Combine"
import { FixedUiElement } from "../Base/FixedUiElement"
import { Utils } from "../../Utils"
import BaseUIElement from "../BaseUIElement"
import SvelteUIElement from "../Base/SvelteUIElement"
import Up from "../../assets/svg/Up.svelte"
import Circle from "../../assets/svg/Circle.svelte"

export default class Histogram<T> extends VariableUiElement {
    private static defaultPalette = [
        "#ff5858",
        "#ffad48",
        "#ffff59",
        "#56bd56",
        "#63a9ff",
        "#9d62d9",
        "#fa61fa",
    ]

    constructor(
        values: Store<string[]>,
        title: string | BaseUIElement,
        countTitle: string | BaseUIElement,
        options?: {
            assignColor?: (t0: string) => string
            sortMode?: "name" | "name-rev" | "count" | "count-rev"
        }
    ) {
        const sortMode = new UIEventSource<"name" | "name-rev" | "count" | "count-rev">(
            options?.sortMode ?? "name"
        )
        const sortName = new VariableUiElement(
            sortMode.map((m) => {
                switch (m) {
                    case "name":
                        return new SvelteUIElement(Up)
                    case "name-rev":
                        return new SvelteUIElement(Up).SetStyle("transform: rotate(180deg)")
                    default:
                        return new SvelteUIElement(Circle)
                }
            })
        )
        const titleHeader = new Combine([sortName.SetClass("w-4 mr-2"), title])
            .SetClass("flex")
            .onClick(() => {
                if (sortMode.data === "name") {
                    sortMode.setData("name-rev")
                } else {
                    sortMode.setData("name")
                }
            })

        const sortCount = new VariableUiElement(
            sortMode.map((m) => {
                switch (m) {
                    case "count":
                        return new SvelteUIElement(Up)
                    case "count-rev":
                        return new SvelteUIElement(Up).SetStyle("transform: rotate(180deg)")
                    default:
                        return new SvelteUIElement(Circle)
                }
            })
        )

        const countHeader = new Combine([sortCount.SetClass("w-4 mr-2"), countTitle])
            .SetClass("flex")
            .onClick(() => {
                if (sortMode.data === "count-rev") {
                    sortMode.setData("count")
                } else {
                    sortMode.setData("count-rev")
                }
            })

        const header = [titleHeader, countHeader]

        super(
            values.map(
                (values) => {
                    if (values === undefined) {
                        return undefined
                    }

                    values = Utils.NoNull(values)

                    const counts = new Map<string, number>()
                    for (const value of values) {
                        const c = counts.get(value) ?? 0
                        counts.set(value, c + 1)
                    }

                    const keys = Array.from(counts.keys())

                    switch (sortMode.data) {
                        case "name":
                            keys.sort()
                            break
                        case "name-rev":
                            keys.sort().reverse(/*Copy of array, inplace reverse if fine*/)
                            break
                        case "count":
                            keys.sort((k0, k1) => counts.get(k0) - counts.get(k1))
                            break
                        case "count-rev":
                            keys.sort((k0, k1) => counts.get(k1) - counts.get(k0))
                            break
                    }

                    const max = Math.max(...Array.from(counts.values()))

                    const fallbackColor = (keyValue: string) => {
                        const index = keys.indexOf(keyValue)
                        return Histogram.defaultPalette[index % Histogram.defaultPalette.length]
                    }
                    let actualAssignColor = undefined
                    if (options?.assignColor === undefined) {
                        actualAssignColor = fallbackColor
                    } else {
                        actualAssignColor = (keyValue: string) => {
                            return options.assignColor(keyValue) ?? fallbackColor(keyValue)
                        }
                    }

                    return new Table(
                        header,
                        keys.map((key) => [
                            key,
                            new Combine([
                                new Combine([
                                    new FixedUiElement("" + counts.get(key)).SetClass(
                                        "font-bold rounded-full block"
                                    ),
                                ])
                                    .SetClass("flex justify-center rounded border border-black")
                                    .SetStyle(
                                        `background: ${actualAssignColor(key)}; width: ${
                                            (100 * counts.get(key)) / max
                                        }%`
                                    ),
                            ]).SetClass("block w-full"),
                        ]),
                        {
                            contentStyle: keys.map((_) => ["width: 20%"]),
                        }
                    ).SetClass("w-full zebra-table")
                },
                [sortMode]
            )
        )
    }
}
