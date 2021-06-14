import {RadioButton} from "./UI/Input/RadioButton";
import {FixedInputElement} from "./UI/Input/FixedInputElement";
import {SubstitutedTranslation} from "./UI/SubstitutedTranslation";
import {UIEventSource} from "./Logic/UIEventSource";
import {Translation} from "./UI/i18n/Translation";
import TagRenderingAnswer from "./UI/Popup/TagRenderingAnswer";
import TagRenderingConfig from "./Customizations/JSON/TagRenderingConfig";
import EditableTagRendering from "./UI/Popup/EditableTagRendering";


const tagsSource = new UIEventSource({
    id:'id',
    name:'name',
    surface:'asphalt'
})

const config = new TagRenderingConfig({
  render: "Rendering {name} {id} {surface}"  
}, null, "test")

new EditableTagRendering(
    tagsSource,
    config
).AttachTo("extradiv")


window.v = tagsSource