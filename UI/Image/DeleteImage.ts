import {UIEventSource} from "../../Logic/UIEventSource";
import Translations from "../i18n/Translations";
import Toggle from "../Input/Toggle";
import Combine from "../Base/Combine";
import State from "../../State";
import Svg from "../../Svg";
import {Tag} from "../../Logic/Tags/Tag";
import ChangeTagAction from "../../Logic/Osm/Actions/ChangeTagAction";


export default class DeleteImage extends Toggle {

    constructor(key: string, tags: UIEventSource<any>) {
        const oldValue = tags.data[key]
        const isDeletedBadge = Translations.t.image.isDeleted.Clone()
            .SetClass("rounded-full p-1")
            .SetStyle("color:white;background:#ff8c8c")
            .onClick(() => {
                State.state?.changes?.
                    applyAction(new ChangeTagAction(tags.data.id, new Tag(key, oldValue), tags.data))
            });

        const deleteButton = Translations.t.image.doDelete.Clone()
            .SetClass("block w-full pl-4 pr-4")
            .SetStyle("color:white;background:#ff8c8c; border-top-left-radius:30rem; border-top-right-radius: 30rem;")
            .onClick(() => {
                State.state?.changes?.applyAction(
                new ChangeTagAction(    tags.data.id, new Tag(key, ""), tags.data)
                )
            });

        const cancelButton = Translations.t.general.cancel.Clone().SetClass("bg-white pl-4 pr-4").SetStyle("border-bottom-left-radius:30rem; border-bottom-right-radius: 30rem;");
        const openDelete = Svg.delete_icon_svg().SetStyle("width: 2em; height: 2em; display:block;")
        const deleteDialog = new Toggle(
            new Combine([
                deleteButton,
                cancelButton
            ]).SetClass("flex flex-col background-black"),
            openDelete
        )

        cancelButton.onClick(() => deleteDialog.isEnabled.setData(false))
        openDelete.onClick(() => deleteDialog.isEnabled.setData(true))

        super(
            new Toggle(
                deleteDialog,
                isDeletedBadge,
                tags.map(tags => (tags[key] ?? "") !== "")
            ),
            undefined /*Login (and thus editing) is disabled*/,
            State.state?.featureSwitchUserbadge ?? new UIEventSource<boolean>(true)
        )
        this.SetClass("cursor-pointer")
    }

}