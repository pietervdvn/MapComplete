import {UIEventSource} from "../../Logic/UIEventSource";
import {InputElement} from "../Input/InputElement";
import {UIElement} from "../UIElement";
import Translations from "../i18n/Translations";
import Combine from "../Base/Combine";
import {VariableUiElement} from "../Base/VariableUIElement";

export default class SingleSetting<T> {
    public _value: InputElement<T>;
    public _name: string;
    public _description: UIElement;
    public _options: { showIconPreview?: boolean };

    constructor(config: UIEventSource<any>,
                value: InputElement<T>,
                path: string | (string | number)[],
                name: string,
                description: string | UIElement,
                options?: {
                    showIconPreview?: boolean
                }
    ) {
        this._value = value;
        this._name = name;
        this._description = Translations.W(description);

        this._options = options ?? {};
        if (this._options.showIconPreview) {
            this._description = new Combine([
                this._description,
                "<h3>Icon preview</h3>",
                new VariableUiElement(this._value.GetValue().map(url => `<img src='${url}' class="image-large-preview">`))
            ]);
        }

        if(typeof (path) === "string"){
            path = [path];
        }
        const lastPart = path[path.length - 1];
        path.splice(path.length - 1, 1);

        function assignValue(value) {
            if (value === undefined) {
                return;
            }
            // We have to rewalk every time as parts might be new
            let configPart = config.data;
            for (const pathPart of path) {
                let newConfigPart = configPart[pathPart];
                if (newConfigPart === undefined) {
                    if (typeof (pathPart) === "string") {
                        configPart[pathPart] = {};
                    } else {
                        configPart[pathPart] = [];
                    }
                    newConfigPart = configPart[pathPart];
                }
                configPart = newConfigPart;
            }
            configPart[lastPart] = value;
            config.ping();
        }

        function loadValue() {
            let configPart = config.data;
            for (const pathPart of path) {
                configPart = configPart[pathPart];
                if (configPart === undefined) {
                    return;
                }
            }
            const loadedValue = configPart[lastPart];
            if (loadedValue !== undefined) {
                value.GetValue().setData(loadedValue);
            }
        }
        loadValue();
        config.addCallback(() => loadValue());

        value.GetValue().addCallback(assignValue);
        assignValue(this._value.GetValue().data);
        

    }
    
    


}