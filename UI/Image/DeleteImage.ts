import {UIElement} from "../UIElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import Translations from "../i18n/Translations";
import CheckBox from "../Input/CheckBox";
import Combine from "../Base/Combine";
import State from "../../State";
import {Tag} from "../../Logic/Tags";
import Svg from "../../Svg";


export default class DeleteImage extends UIElement {
    private readonly key: string;
    private readonly tags: UIEventSource<any>;

    private readonly isDeletedBadge: UIElement;
    private readonly deleteDialog: UIElement;

    constructor(key: string, tags: UIEventSource<any>) {
        super(tags);
        this.tags = tags;
        this.key = key;

        this.isDeletedBadge = Translations.t.image.isDeleted;

        const style = "display:block;color:white;width:100%;"
        const deleteButton = Translations.t.image.doDelete.Clone()
            .SetStyle(style+"background:#ff8c8c;")
            .onClick(() => {
                State.state?.changes.addTag(tags.data.id, new Tag(key, ""));
            });

        const cancelButton = Translations.t.general.cancel;
        this.deleteDialog = new CheckBox(
            new Combine([
                deleteButton,
                cancelButton
                
            ]).SetStyle("display:flex;flex-direction:column;"),
            Svg.delete_icon_ui().SetStyle('width:1.5em;display:block;padding-left: calc(50% - 0.75em);')
        )

    }

    InnerRender(): string {
        if(! State.state?.featureSwitchUserbadge?.data){
            return "";
        }

        const value = this.tags.data[this.key];
        if (value === undefined || value === "") {
            return this.isDeletedBadge.Render();
        }

        return this.deleteDialog.Render();
    }

}