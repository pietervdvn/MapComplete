import {VariableUiElement} from "./UI/Base/VariableUIElement";
import {UIEventSource} from "./Logic/UIEventSource";
import Wikidata from "./Logic/Web/Wikidata";
import Combine from "./UI/Base/Combine";
import {FixedUiElement} from "./UI/Base/FixedUiElement";

const result = UIEventSource.FromPromise(
    Wikidata.searchAdvanced("WOlf", {
        lang: "nl",
        maxCount: 100,
        instanceOf: 5
    })
)
result.addCallbackAndRunD(r => console.log(r))
new VariableUiElement(result.map(items =>new Combine( (items??[])?.map(i => 
    new FixedUiElement(JSON.stringify(i, null, "  ")).SetClass("p-4 block")
))  )).SetClass("flex flex-col").AttachTo("maindiv")