import {UIElement} from "../UIElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import Translations from "../i18n/Translations";
import CheckBox from "../Input/CheckBox";
import Combine from "../Base/Combine";
import State from "../../State";
import Svg from "../../Svg";
import {Tag} from "../../Logic/Tags/Tag";


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

        const deleteButton = Translations.t.image.doDelete.Clone()
            .SetClass("block w-full pl-4 pr-4")
            .SetStyle("color:white;background:#ff8c8c; border-top-left-radius:30rem; border-top-right-radius: 30rem;")
            .onClick(() => {
                State.state?.changes.addTag(tags.data.id, new Tag(key, ""));
            });

        const cancelButton = Translations.t.general.cancel.SetClass("bg-white pl-4 pr-4").SetStyle( "border-bottom-left-radius:30rem; border-bottom-right-radius: 30rem;");
        this.deleteDialog = new CheckBox(
            new Combine([
                deleteButton,
                cancelButton
            ]).SetClass("flex flex-col background-black"),
            Svg.delete_icon_svg().SetStyle("width: 2em; height: 2em; display:block;")
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