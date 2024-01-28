/**
 * The full opening hours element, including the table, opening hours picker.
 * Keeps track of unparsed rules
 * Exports everything conveniently as a string, for direct use
 */
import OpeningHoursPicker from "./OpeningHoursPicker"
import { Store, UIEventSource } from "../../Logic/UIEventSource"
import { VariableUiElement } from "../Base/VariableUIElement"
import Combine from "../Base/Combine"
import { FixedUiElement } from "../Base/FixedUiElement"
import { OH, OpeningHour } from "./OpeningHours"
import { InputElement } from "../Input/InputElement"
import PublicHolidayInput from "./PublicHolidayInput"
import Translations from "../i18n/Translations"
import BaseUIElement from "../BaseUIElement"

export default class OpeningHoursInput extends InputElement<string> {
    private readonly _value: UIEventSource<string>
    private readonly _element: BaseUIElement

    constructor(
        value: UIEventSource<string> = new UIEventSource<string>(""),
        prefix = "",
        postfix = ""
    ) {
        super()
        this._value = value
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
                }
            )
        }

        const leftoverRules: Store<string[]> = valueWithoutPrefix.map((str) => {
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
        const phSelector = new PublicHolidayInput(new UIEventSource<string>(ph))

        // Note: MUST be bound AFTER the leftover rules!
        const rulesFromOhPicker: UIEventSource<OpeningHour[]> = valueWithoutPrefix.sync(
            (str) => {
                return OH.Parse(str)
            },
            [leftoverRules, phSelector.GetValue()],
            (rules, oldString) => {
                // We always add a ';', to easily add new rules. We remove the ';' again at the end of the function
                // Important: spaces are _not_ allowed after a ';' as it'll destabilize the parsing!
                let str = OH.ToString(rules) + ";"
                const ph = phSelector.GetValue().data
                if (ph) {
                    str += ph + ";"
                }

                str += leftoverRules.data.join(";") + ";"

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
            }
        )

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
        )

        const ohPicker = new OpeningHoursPicker(rulesFromOhPicker)

        this._element = new Combine([leftoverWarning, ohPicker, phSelector])
    }

    GetValue(): UIEventSource<string> {
        return this._value
    }

    IsValid(_: string): boolean {
        return true
    }

    protected InnerConstructElement(): HTMLElement {
        return this._element.ConstructElement()
    }
}
