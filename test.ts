import ValidatedTextField from "./UI/Input/ValidatedTextField";
import Combine from "./UI/Base/Combine";
import {VariableUiElement} from "./UI/Base/VariableUIElement";
import {UIEventSource} from "./Logic/UIEventSource";
import TagRenderingConfig from "./Customizations/JSON/TagRenderingConfig";
import State from "./State";
import TagRenderingQuestion from "./UI/Popup/TagRenderingQuestion";


function TestTagRendering(){
    State.state = new State(undefined)
    const tagsSource = new UIEventSource({
        id:"node/1"
    })
    new TagRenderingQuestion(
        tagsSource,
        new TagRenderingConfig({
            multiAnswer: false,
            freeform: {
                key:"valve"
            },
            question: "What valves are supported?",
            render: "This pump supports {valve}",
            mappings: [
                {
                    if: "valve=dunlop",
                    then: "This pump supports dunlop"
                },
                {
                    if:"valve=shrader",
                    then:"shrader is supported",
                }
            ],
            
        }, undefined, "test")
    ).AttachTo("maindiv")
    new VariableUiElement(tagsSource.map(tags => tags["valves"])).SetClass("alert").AttachTo("extradiv")
}

function TestAllInputMethods(){

    new Combine(ValidatedTextField.tpList.map(tp => {
        const tf = ValidatedTextField.InputForType(tp.name);

        return new Combine([tf, new VariableUiElement(tf.GetValue()).SetClass("alert")]);
    })).AttachTo("maindiv")    
}


TestTagRendering()