import {UIElement} from "../UI/UIElement";
import {SubtleButton} from "../UI/Base/SubtleButton";
import {VariableUiElement} from "../UI/Base/VariableUIElement";
import SingleSetting from "../UI/CustomGenerator/SingleSetting";
import Combine from "../UI/Base/Combine";
import {UIEventSource} from "../Logic/UIEventSource";

export default class HelpText extends UIElement {

    private helpText: UIElement;
    private returnButton: UIElement;

    constructor(currentSetting: UIEventSource<SingleSetting<any>>) {
        super();
        this.returnButton = new SubtleButton("./assets/close.svg",
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
                    "Want to see how the quests are doing in number of visits? All the stats are open on <a href='pietervdvn.goatcounter.com' target='_blank'>goatcounter</a>";
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