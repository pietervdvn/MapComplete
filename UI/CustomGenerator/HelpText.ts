import {UIEventSource} from "../../Logic/UIEventSource";
import {UIElement} from "../UIElement";
import {VariableUiElement} from "../Base/VariableUIElement";
import {SubtleButton} from "../Base/SubtleButton";
import Combine from "../Base/Combine";
import SingleSetting from "./SingleSetting";
import Svg from "../../Svg";

export default class HelpText extends UIElement {

    private helpText: UIElement;
    private returnButton: UIElement;

    constructor(currentSetting: UIEventSource<SingleSetting<any>>) {
        super();
        this.returnButton = new SubtleButton(Svg.close_ui(),
            new VariableUiElement(
                currentSetting.map(currentSetting => {
                        if (currentSetting === undefined) {
                            return "";
                        }
                        return "Return to general help";
                    }
                )
            ))
            .ListenTo(currentSetting)
            .SetClass("small-button")
            .onClick(() => currentSetting.setData(undefined));


        this.helpText = new VariableUiElement(currentSetting.map((setting: SingleSetting<any>) => {
            if (setting === undefined) {
                return "<h1>Welcome to the Custom Theme Builder</h1>" +
                    "Here, one can make their own custom mapcomplete themes.<br/>" +
                    "Fill out the fields to get a working mapcomplete theme. More information on the selected field will appear here when you click it.<br/>" +
                    "Want to see how the quests are doing in number of visits? All the stats are open on <a href='https://pietervdvn.goatcounter.com' target='_blank'>goatcounter</a>";
            }

            return new Combine(["<h1>", setting._name, "</h1>", setting._description.Render()]).Render();
        }))


    }

    InnerRender(): string {
        return new Combine([this.helpText,
            this.returnButton,
        ]).Render();
    }

}