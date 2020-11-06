import {UIElement} from "../UIElement";
import {VariableUiElement} from "../Base/VariableUIElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import {LayoutConfigJson} from "../../Customizations/JSON/LayoutConfigJson";
import Combine from "../Base/Combine";
import {OsmConnection} from "../../Logic/Osm/OsmConnection";
import {FixedUiElement} from "../Base/FixedUiElement";
import {TextField} from "../Input/TextField";
import {SubtleButton} from "../Base/SubtleButton";
import Svg from "../../Svg";

export default class SavePanel extends UIElement {
    private json: UIElement;
    private lastSaveEl: UIElement;
    private loadFromJson: UIElement;

    constructor(
        connection: OsmConnection,
        config: UIEventSource<LayoutConfigJson>,
        chronic: UIEventSource<Date>) {
        super();


        this.lastSaveEl = new VariableUiElement(chronic
            .map(date => {
                if (date === undefined) {
                    return new FixedUiElement("Your theme will be saved automatically within two minutes... Click here to force saving").SetClass("alert").Render()
                }
                return "Your theme was last saved at " + date.toISOString()
            })).onClick(() => chronic.setData(new Date()));

        const jsonStr = config.map(config =>
            JSON.stringify(config, null, 2));


       const jsonTextField = new TextField({
            placeholder: "JSON Config",
            value: jsonStr,
            textArea: true,
            textAreaRows: 20
        });
        this.json = jsonTextField;
        this.loadFromJson = new SubtleButton(Svg.reload_ui(), "<b>Load the JSON file below</b>")
            .onClick(() => {
                try{
                    const json = jsonTextField.GetValue().data;
                    const parsed : LayoutConfigJson = JSON.parse(json);
                    config.setData(parsed);
                }catch(e){
                    alert("Invalid JSON: "+e)
                }
            });
    }

    InnerRender(): string {
        return new Combine([
            "<h3>Save your theme</h3>",
            this.lastSaveEl,
            "<h3>JSON configuration</h3>",
            "The url hash is actually no more then a BASE64-encoding of the below JSON. This json contains the full configuration of the theme.<br/>" +
            "This configuration is mainly useful for debugging",
            "<br/>",
            this.loadFromJson,
            this.json
        ]).SetClass("scrollable")
            .Render();
    }

}