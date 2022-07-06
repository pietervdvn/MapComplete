import {UIEventSource} from "./Logic/UIEventSource";
import TagRenderingQuestion from "./UI/Popup/TagRenderingQuestion";
import TagRenderingConfig from "./Models/ThemeConfig/TagRenderingConfig";
import {RadioButton} from "./UI/Input/RadioButton";
import {FixedInputElement} from "./UI/Input/FixedInputElement";
import {VariableUiElement} from "./UI/Base/VariableUIElement";
import ValidatedTextField from "./UI/Input/ValidatedTextField";
import VariableInputElement from "./UI/Input/VariableInputElement";

const config = new TagRenderingConfig({
    question: "What is the name?",
    render: "The name is {name}",
    freeform: {
        key: 'name',
        inline:true
    },
    mappings:[
        {
            if:"noname=yes",
            then: "This feature has no name"
        }
    ]
})

const tags = new UIEventSource<any>({
    name: "current feature name"
})

/*new TagRenderingQuestion(
    tags, config, undefined).AttachTo("maindiv")*/
const options = new UIEventSource<string[]>([])
const rb =
    new VariableInputElement(
        options.map(options  => {
            console.trace("Construction an input element for", options)
           return new RadioButton(
                [
                    ...options.map(o => new FixedInputElement(o,o)),
                    new FixedInputElement<string>("abc", "abc"),
                    ValidatedTextField.ForType().ConstructInputElement()
                ])
        }
        
    )
    
)
rb.AttachTo("maindiv")
rb.GetValue().addCallbackAndRun(v => console.log("Current value is",v))
new VariableUiElement(rb.GetValue()).AttachTo("extradiv")

window.setTimeout(() => {options.setData(["xyz","foo","bar"])},10000)