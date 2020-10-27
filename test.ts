//*


import {UIEventSource} from "./Logic/UIEventSource";
import {TagRenderingConfigJson} from "./Customizations/JSON/TagRenderingConfigJson";
import TagRenderingConfig from "./Customizations/JSON/TagRenderingConfig";
import Locale from "./UI/i18n/Locale";
import EditableTagRendering from "./UI/Popup/EditableTagRendering";

const tagRendering: TagRenderingConfigJson = {
    question: {"en": "What is the name of?", nl: "Wat is de naam van?", fr: "C'est quoi le nom"},
    mappings: [
        {
            if: "noname=yes",
            then: "Has no name"
        }
    ],
    render: "The name is {name}",
    freeform: {
        key: "name",
        type: "string",
        addExtraTags: ["noname="]
    }//*/
}

const config = new TagRenderingConfig(tagRendering)

const tags = new UIEventSource({id: "node/-1", "amenity": "bench", name: "pietervdvn"})

// new TagRenderingQuestion(tags, config).AttachTo("maindiv")
new EditableTagRendering(tags, config).AttachTo('maindiv')
Locale.CreateLanguagePicker(["nl", "en", "fr"]).AttachTo("extradiv")
/*/


import {Utils} from "./Utils";
import {FixedUiElement} from "./UI/Base/FixedUiElement";

Utils.generateStats((stats) => {
   new FixedUiElement(stats).AttachTo('maindiv')
})
//*/