import Combine from "./UI/Base/Combine";
import ValidatedTextField from "./UI/Input/ValidatedTextField";
import Title from "./UI/Base/Title";
import {FixedUiElement} from "./UI/Base/FixedUiElement";
import {VariableUiElement} from "./UI/Base/VariableUIElement";
import {UIEventSource} from "./Logic/UIEventSource";
import {Translation} from "./UI/i18n/Translation";

new Combine(
    ValidatedTextField.AvailableTypes().map(key => {
            let inp;
            const feedback = new UIEventSource<Translation>(undefined)
            try {
                inp = ValidatedTextField.ForType(key).ConstructInputElement({
                    feedback,
                    country: () => "be",
                    
                });
            } catch (e) {
                console.error(e)
                inp = new FixedUiElement(e).SetClass("alert")
            }

            return new Combine([
                new Title(key),
                inp,
                new VariableUiElement(inp.GetValue()),
                new VariableUiElement(feedback.map(v => v?.SetClass("alert")))
            ]);
        }
    )
).AttachTo("maindiv")

