/**
 * The full opening hours element, including the table, opening hours picker.
 * Keeps track of unparsed rules
 * Exports everything conventiently as a string, for direct use
 */
import OpeningHoursPicker from "./OpeningHoursPicker";
import {UIEventSource} from "../../Logic/UIEventSource";
import {VariableUiElement} from "../Base/VariableUIElement";
import Combine from "../Base/Combine";
import {FixedUiElement} from "../Base/FixedUiElement";
import {OH} from "./OpeningHours";
import {InputElement} from "../Input/InputElement";
import PublicHolidayInput from "./PublicHolidayInput";
import Translations from "../i18n/Translations";
import {Utils} from "../../Utils";
import BaseUIElement from "../BaseUIElement";


export default class OpeningHoursInput extends InputElement<string> {


    public readonly IsSelected: UIEventSource<boolean> = new UIEventSource<boolean>(false);
    private readonly _value: UIEventSource<string>;
    private readonly _element: BaseUIElement;

    constructor(value: UIEventSource<string> = new UIEventSource<string>(""), prefix = "", postfix = "") {
        super();
        this._value = value;
        let valueWithoutPrefix = value
        if (prefix !== "" && postfix !== "") {
       
            valueWithoutPrefix = value.map(str => {
                if (str === undefined) {
                    return undefined;
                }
                if(str === ""){
                    return ""
                }
                if (str.startsWith(prefix) && str.endsWith(postfix)) {
                    return str.substring(prefix.length, str.length - postfix.length)
                }
                return str
            }, [], noPrefix => {
                if (noPrefix === undefined) {
                    return undefined;
                }
                if(noPrefix === ""){
                    return ""
                }
                if (noPrefix.startsWith(prefix) && noPrefix.endsWith(postfix)) {
                    return noPrefix
                }

                return prefix + noPrefix + postfix
            })
        }

        const leftoverRules = valueWithoutPrefix.map<string[]>(str => {
            if (str === undefined) {
                return []
            }
            const leftOvers: string[] = [];
            const rules = str.split(";");
            for (const rule of rules) {
                if (OH.ParseRule(rule) !== null) {
                    continue;
                }
                if (OH.ParsePHRule(rule) !== null) {
                    continue;
                }
                leftOvers.push(rule);
            }
            return leftOvers;
        })
        // Note: MUST be bound AFTER the leftover rules!
        const rulesFromOhPicker = valueWithoutPrefix.map(OH.Parse);

        const ph = valueWithoutPrefix.map<string>(str => {
            if (str === undefined) {
                return ""
            }
            const rules = str.split(";");
            for (const rule of rules) {
                if (OH.ParsePHRule(rule) !== null) {
                    return rule;
                }
            }
            return "";
        })
        const phSelector = new PublicHolidayInput(ph);

        function update() {
            const regular = OH.ToString(rulesFromOhPicker.data);
            const rules: string[] = [
                regular,
                ...leftoverRules.data,
                ph.data
            ]
            valueWithoutPrefix.setData(Utils.NoEmpty(rules).join(";"));
        }

        rulesFromOhPicker.addCallback(update);
        ph.addCallback(update);

        const leftoverWarning = new VariableUiElement(leftoverRules.map((leftovers: string[]) => {

            if (leftovers.length == 0) {
                return "";
            }
            return new Combine([
                Translations.t.general.opening_hours.not_all_rules_parsed,
                new FixedUiElement(leftovers.map(r => `${r}<br/>`).join("")).SetClass("subtle")
            ]);

        }))

        const ohPicker = new OpeningHoursPicker(rulesFromOhPicker);

        this._element = new Combine([
            leftoverWarning,
            ohPicker,
            phSelector
        ])
    }

    GetValue(): UIEventSource<string> {
        return this._value;
    }

    IsValid(t: string): boolean {
        return true;
    }

    protected InnerConstructElement(): HTMLElement {
        return this._element.ConstructElement()
    }

}