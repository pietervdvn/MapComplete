import {UIElement} from "../UIElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import {LayoutConfigJson} from "../../Customizations/JSON/LayoutConfigJson";
import SettingsTable from "./SettingsTable";
import SingleSetting from "./SingleSetting";
import {SubtleButton} from "../Base/SubtleButton";
import Combine from "../Base/Combine";
import {TextField} from "../Input/TextField";
import {InputElement} from "../Input/InputElement";
import MultiLingualTextFields from "../Input/MultiLingualTextFields";
import {CheckBox} from "../Input/CheckBox";
import {MultiTagInput} from "../Input/MultiTagInput";

/**
 * Shows the configuration for a single layer
 */
export default class LayerPanel extends UIElement {
    private _config: UIEventSource<LayoutConfigJson>;

    private settingsTable: UIElement;

    private deleteButton: UIElement;

    constructor(config: UIEventSource<LayoutConfigJson>,
                languages: UIEventSource<string[]>,
                index: number,
                currentlySelected: UIEventSource<SingleSetting<any>>) {
        super(undefined);
        this._config = config;

        const actualDeleteButton = new SubtleButton(
            "./assets/delete.svg",
            "Yes, delete this layer"
        ).onClick(() => {
            config.data.layers.splice(index, 1);
            config.ping();
        });

        this.deleteButton = new CheckBox(
            new Combine(
                [
                    "<h3>Confirm layer deletion</h3>",
                    new SubtleButton(
                        "./assets/close.svg",
                        "No, don't delete"
                    ),
                    "<span class='alert'>Deleting a layer can not be undone!</span>",
                    actualDeleteButton
                ]
            ),
            new SubtleButton(
                "./assets/delete.svg",
                "Remove this layer"
            )
        )

        function setting(input: InputElement<any>, path: string | string[], name: string, description: string | UIElement): SingleSetting<any> {
            let pathPre = ["layers", index];
            if (typeof (path) === "string") {
                pathPre.push(path);
            } else {
                pathPre = pathPre.concat(path);
            }

            return new SingleSetting<any>(config, input, pathPre, name, description);
        }


        this.settingsTable = new SettingsTable([
                setting(TextField.StringInput(), "id", "Id", "An identifier for this layer<br/>This should be a simple, lowercase, human readable string that is used to identify the layer."),
                setting(new MultiLingualTextFields(languages), "title", "Title", "The human-readable name of this layer<br/>Used in the layer control panel and the 'Personal theme'"),
                setting(new MultiLingualTextFields(languages, true), "description", "Description", "A description for this layer.<br/>Shown in the layer selections and in the personal theme"),
                setting(new MultiTagInput(), "overpassTags","Overpass query",
                    new Combine(["The tags to load from overpass. ", MultiTagInput.tagExplanation]))
            ],
            currentlySelected
        )
        ;
    }

    InnerRender(): string {
        return new Combine([
            this.settingsTable,
            this.deleteButton
        ]).Render();
    }
}