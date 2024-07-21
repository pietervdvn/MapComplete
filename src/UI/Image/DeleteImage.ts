import { Store } from "../../Logic/UIEventSource"
import Translations from "../i18n/Translations"
import Toggle, { ClickableToggle } from "../Input/Toggle"
import Combine from "../Base/Combine"
import { Tag } from "../../Logic/Tags/Tag"
import ChangeTagAction from "../../Logic/Osm/Actions/ChangeTagAction"
import { Changes } from "../../Logic/Osm/Changes"
import { OsmConnection } from "../../Logic/Osm/OsmConnection"
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig"
import SvelteUIElement from "../Base/SvelteUIElement"
import Delete_icon from "../../assets/svg/Delete_icon.svelte"

export default class DeleteImage extends Toggle {
    constructor(
        key: string,
        tags: Store<any>,
        state: { layout: LayoutConfig; changes?: Changes; osmConnection?: OsmConnection }
    ) {
        const oldValue = tags.data[key]
        const isDeletedBadge = Translations.t.image.isDeleted
            .Clone()
            .SetClass("rounded-full p-1")
            .SetStyle("color:white;background:#ff8c8c")
            .onClick(async () => {
                await state?.changes?.applyAction(
                    new ChangeTagAction(tags.data.id, new Tag(key, oldValue), tags.data, {
                        changeType: "delete-image",
                        theme: state.layout.id,
                    })
                )
            })

        const deleteButton = Translations.t.image.doDelete
            .Clone()
            .SetClass("block w-full pl-4 pr-4")
            .SetStyle(
                "color:white;background:#ff8c8c; border-top-left-radius:30rem; border-top-right-radius: 30rem;"
            )
            .onClick(async () => {
                await state?.changes?.applyAction(
                    new ChangeTagAction(tags.data.id, new Tag(key, ""), tags.data, {
                        changeType: "answer",
                        theme: state.layout.id,
                    })
                )
            })

        const cancelButton = Translations.t.general.cancel
            .Clone()
            .SetClass("bg-white pl-4 pr-4")
            .SetStyle("border-bottom-left-radius:30rem; border-bottom-right-radius: 30rem;")
        const openDelete = new SvelteUIElement(Delete_icon).SetStyle(
            "width: 2em; height: 2em; display:block;"
        )
        const deleteDialog = new ClickableToggle(
            new Combine([deleteButton, cancelButton]).SetClass("flex flex-col background-black"),
            openDelete
        )

        cancelButton.onClick(() => deleteDialog.isEnabled.setData(false))
        openDelete.onClick(() => deleteDialog.isEnabled.setData(true))

        super(
            new Toggle(
                deleteDialog,
                isDeletedBadge,
                tags.map((tags) => (tags[key] ?? "") !== "")
            ),
            undefined /*Login (and thus editing) is disabled*/,
            state?.osmConnection?.isLoggedIn
        )
        this.SetClass("cursor-pointer")
    }
}
