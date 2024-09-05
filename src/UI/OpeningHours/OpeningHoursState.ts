/**
 * The full opening hours element, including the table, opening hours picker.
 * Keeps track of unparsed rules
 * Exports everything conveniently as a string, for direct use
 */
import { Store, UIEventSource } from "../../Logic/UIEventSource"
import { OH, OpeningHour } from "./OpeningHours"

export default class OpeningHoursState {
    public readonly normalOhs: UIEventSource<OpeningHour[]>
    public readonly leftoverRules: Store<string[]>
    public readonly phSelectorValue: UIEventSource<string>

    constructor(
        value: UIEventSource<string> = new UIEventSource<string>(""),
        prefix = "",
        postfix = "",
    ) {
        let valueWithoutPrefix = value
        if (prefix !== "" && postfix !== "") {
            valueWithoutPrefix = value.sync(
                (str) => {
                    if (str === undefined) {
                        return undefined
                    }
                    if (str === "") {
                        return ""
                    }
                    if (str.startsWith(prefix) && str.endsWith(postfix)) {
                        return str.substring(prefix.length, str.length - postfix.length)
                    }
                    return str
                },
                [],
                (noPrefix) => {
                    if (noPrefix === undefined) {
                        return undefined
                    }
                    if (noPrefix === "") {
                        return ""
                    }
                    if (noPrefix.startsWith(prefix) && noPrefix.endsWith(postfix)) {
                        return noPrefix
                    }

                    return prefix + noPrefix + postfix
                },
            )
        }

        this.leftoverRules = valueWithoutPrefix.map((str) => {
            if (str === undefined) {
                return []
            }
            const leftOvers: string[] = []
            const rules = str.split(";")
            for (const rule of rules) {
                if (OH.ParseRule(rule) !== null) {
                    continue
                }
                if (OH.ParsePHRule(rule) !== null) {
                    continue
                }
                if (leftOvers.indexOf(rule) >= 0) {
                    continue
                }
                leftOvers.push(rule)
            }
            return leftOvers
        })

        let ph = ""
        const rules = valueWithoutPrefix.data?.split(";") ?? []
        for (const rule of rules) {
            if (OH.ParsePHRule(rule) !== null) {
                // We found the rule containing the public holiday information
                ph = rule
                break
            }
        }
        this.phSelectorValue = new UIEventSource<string>(ph ?? "")


        // Note: MUST be bound AFTER the leftover rules!
        this.normalOhs = valueWithoutPrefix.sync(
            (str) => {
                return OH.Parse(str)
            },
            [this.leftoverRules, this.phSelectorValue],
            (rules, oldString) => {
                // We always add a ';', to easily add new rules. We remove the ';' again at the end of the function
                // Important: spaces are _not_ allowed after a ';' as it'll destabilize the parsing!
                let str = OH.ToString(rules) + ";"
                const ph = this.phSelectorValue.data
                if (ph) {
                    str += ph + ";"
                }

                str += this.leftoverRules.data.join(";") + ";"

                str = str.trim()
                while (str.endsWith(";")) {
                    str = str.substring(0, str.length - 1)
                }
                if (str.startsWith(";")) {
                    str = str.substring(1)
                }
                str.trim()

                if (str === oldString) {
                    return oldString // We pass a reference to the old string to stabilize the EventSource
                }
                return str
            },
        )
        /*
                const leftoverWarning = new VariableUiElement(
                    leftoverRules.map((leftovers: string[]) => {
                        if (leftovers.length == 0) {
                            return ""
                        }
                        return new Combine([
                            Translations.t.general.opening_hours.not_all_rules_parsed,
                            new FixedUiElement(leftovers.map((r) => `${r}<br/>`).join("")).SetClass(
                                "subtle"
                            ),
                        ])
                    })
                )*/


    }

}
