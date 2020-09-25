import {InputElement} from "./InputElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import {TextField} from "./TextField";

export default class MultiLingualTextFields extends InputElement<any> {
    private _fields: Map<string, TextField> = new Map<string, TextField>();
    private readonly _value: UIEventSource<any>;
    public readonly IsSelected: UIEventSource<boolean> = new UIEventSource<boolean>(false);
    constructor(languages: UIEventSource<string[]>,
                textArea: boolean = false,
                value: UIEventSource<Map<string, UIEventSource<string>>> = undefined) {
        super(undefined);
        this._value = value ?? new UIEventSource({});
        this._value.addCallbackAndRun(latestData => {
            if (typeof (latestData) === "string") {
                console.warn("Refusing string for multilingual input", latestData);
                self._value.setData({});
            }
        })
        
        const self = this;

        function setup(languages: string[]) {
            if (languages === undefined) {
                return;
            }
            const newFields = new Map<string, TextField>();
            for (const language of languages) {
                if (language.length != 2) {
                    continue;
                }
                
                let oldField = self._fields.get(language);
                if (oldField === undefined) {
                    oldField = new TextField({textArea: textArea});
                    oldField.GetValue().addCallback(str => {
                        self._value.data[language] = str;
                        self._value.ping();
                    });
                    oldField.GetValue().setData(self._value.data[language]);
                    
                    oldField.IsSelected.addCallback(() => {
                        let selected = false;
                        self._fields.forEach(value => {selected = selected || value.IsSelected.data});
                        self.IsSelected.setData(selected);
                    })
                    
                }
                newFields.set(language, oldField);
            }
            self._fields = newFields;
            self.Update();

          
        }

        setup(languages.data);
        languages.addCallback(setup);


        function load(latest: any){
            if(latest === undefined){
                return;
            }
            for (const lang in latest) {
                self._fields.get(lang)?.GetValue().setData(latest[lang]);
            }
        }
        this._value.addCallback(load);
        load(this._value.data);
    }

    protected InnerUpdate(htmlElement: HTMLElement) {
        super.InnerUpdate(htmlElement);
        this._fields.forEach(value => value.Update());
    }

    GetValue(): UIEventSource<Map<string, UIEventSource<string>>> {
        return this._value;
    }

    InnerRender(): string {
        let html = "";
        this._fields.forEach((field, lang) => {
            html += `<tr><td>${lang}</td><td>${field.Render()}</td></tr>`
        })
        if(html === ""){
            return "Please define one or more languages"
        }
        
        return `<table>${html}</table>`;
    }


    IsValid(t: any): boolean {
        return true;
    }

}