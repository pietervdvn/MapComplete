import TagRenderingPanel from "./UI/CustomGenerator/TagRenderingPanel";
import {UIEventSource} from "./Logic/UIEventSource";
import {TextField} from "./UI/Input/TextField";
import {VariableUiElement} from "./UI/Base/VariableUIElement";
import SettingsTable from "./UI/CustomGenerator/SettingsTable";
import SingleSetting from "./UI/CustomGenerator/SingleSetting";
import {MultiInput} from "./UI/Input/MultiInput";


const config = new UIEventSource({})
const languages = new UIEventSource(["en","nl"]);
new MultiInput(
    () => "Add a tag rendering",
    () => new TagRenderingPanel(
        
    )
    
    
)