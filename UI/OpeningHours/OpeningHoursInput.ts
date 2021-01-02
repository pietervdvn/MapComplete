/**
 * The full opening hours element, including the table, opening hours picker.
 * Keeps track of unparsed rules
 * Exports everything conventiently as a string, for direct use
 */
import OpeningHoursPicker from "./OpeningHoursPicker";
import {UIEventSource} from "../../Logic/UIEventSource";
import {UIElement} from "../UIElement";
import {VariableUiElement} from "../Base/VariableUIElement";
import Combine from "../Base/Combine";
import {FixedUiElement} from "../Base/FixedUiElement";
import {OH} from "./OpeningHours";
import {InputElement} from "../Input/InputElement";
import PublicHolidayInput from "./PublicHolidayInput";
import Translations from "../i18n/Translations";


export default class OpeningHoursInput extends InputElement<string> {


    private readonly _value: UIEventSource<string>;

    private readonly _ohPicker: UIElement;
    private readonly _leftoverWarning: UIElement;
    private readonly _phSelector: UIElement;

    constructor(value: UIEventSource<string> = new UIEventSource<string>("")) {
        super();

      
        const leftoverRules = value.map<string[]>(str => {
            if (str === undefined) {
                return []
            }
            const leftOvers: string[] = [];
            const rules = str.split(";");
            for (const rule of rules) {
                if (OH.ParseRule(rule) !== null) {
                    continue;
                }
                if (PublicHolidayInput.LoadValue(rule) !== null) {
                    continue;
                }
                leftOvers.push(rule);
            }
            return leftOvers;
        })
        // NOte: MUST be bound AFTER the leftover rules!
        const rulesFromOhPicker = value.map(OH.Parse);

        const ph = value.map<string>(str => {
            if (str === undefined) {
                return ""
            }
            const rules = str.split(";");
            for (const rule of rules) {
                if (PublicHolidayInput.LoadValue(rule) !== null) {
                    return rule;
                }
            }
            return "";
        })
        this._phSelector = new PublicHolidayInput(ph);

        function update() {
            let rules = OH.ToString(rulesFromOhPicker.data);
            if (leftoverRules.data.length != 0) {
                rules += ";" + leftoverRules.data.join(";")
            }
            const phData = ph.data;
            if (phData !== undefined && phData !== "") {
                rules += ";" + phData;
            }
            value.setData(rules);
        }

        rulesFromOhPicker.addCallback(update);
        ph.addCallback(update);

        this._leftoverWarning = new VariableUiElement(leftoverRules.map((leftovers: string[]) => {

            if (leftovers.length == 0) {
                return "";
            }
            return new Combine([
                Translations.t.general.opening_hours.not_all_rules_parsed,
                    new FixedUiElement(leftovers.map(r => `${r}<br/>`).join("")).SetClass("subtle")
            ]).Render();

        }))

        this._ohPicker = new OpeningHoursPicker(rulesFromOhPicker);


    }


    GetValue(): UIEventSource<string> {
        return this._value;
    }

    InnerRender(): string {
        return new Combine([
            this._leftoverWarning,
            this._ohPicker,
            this._phSelector
        ]).Render();
    }


    public readonly IsSelected: UIEventSource<boolean> = new UIEventSource<boolean>(false);

    IsValid(t: string): boolean {
        return true;
    }

}