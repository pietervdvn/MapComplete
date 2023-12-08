import Toggle from "../Input/Toggle"
import { RadioButton } from "../Input/RadioButton"
import { FixedInputElement } from "../Input/FixedInputElement"
import Combine from "../Base/Combine"
import Translations from "../i18n/Translations"
import { TextField } from "../Input/TextField"
import { Store, UIEventSource } from "../../Logic/UIEventSource"
import Title from "../Base/Title"
import { SubtleButton } from "../Base/SubtleButton"
import Svg from "../../Svg"
import { OsmConnection } from "../../Logic/Osm/OsmConnection"
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig"
import { Translation } from "../i18n/Translation"
import { LoginToggle } from "../Popup/LoginButton"
import SvelteUIElement from "../Base/SvelteUIElement"
import Upload from "../../assets/svg/Upload.svelte"

export default class UploadTraceToOsmUI extends LoginToggle {
    constructor(
        trace: (title: string) => string,
        state: {
            layout: LayoutConfig
            osmConnection: OsmConnection
            readonly featureSwitchUserbadge: Store<boolean>
        },
        options?: {
            whenUploaded?: () => void | Promise<void>
        }
    ) {
        const t = Translations.t.general.uploadGpx
        const uploadFinished = new UIEventSource(false)
        const traceVisibilities: {
            key: "private" | "public"
            name: Translation
            docs: Translation
        }[] = [
            {
                key: "private",
                ...t.modes.private,
            },
            {
                key: "public",
                ...t.modes.public,
            },
        ]

        const dropdown = new RadioButton<"private" | "public">(
            traceVisibilities.map(
                (tv) =>
                    new FixedInputElement<"private" | "public">(
                        new Combine([
                            Translations.W(tv.name).SetClass("font-bold"),
                            tv.docs,
                        ]).SetClass("flex flex-col"),
                        tv.key
                    )
            ),
            {
                value: <any>state?.osmConnection?.GetPreference("gps.trace.visibility"),
            }
        )
        const description = new TextField({
            placeholder: t.meta.descriptionPlaceHolder,
        })
        const title = new TextField({
            placeholder: t.meta.titlePlaceholder,
        })
        const clicked = new UIEventSource<boolean>(false)

        const confirmPanel = new Combine([
            new Title(t.title),
            t.intro0,
            t.intro1,

            t.choosePermission,
            dropdown,
            new Title(t.meta.title, 4),
            t.meta.intro,
            title,
            t.meta.descriptionIntro,
            description,
            new Combine([
                new SubtleButton(Svg.close_svg(), Translations.t.general.cancel)
                    .onClick(() => {
                        clicked.setData(false)
                    })
                    .SetClass(""),
                new SubtleButton(new SvelteUIElement(Upload, {}), t.confirm).OnClickWithLoading(
                    t.uploading,
                    async () => {
                        const titleStr = UploadTraceToOsmUI.createDefault(
                            title.GetValue().data,
                            "Track with mapcomplete"
                        )
                        const descriptionStr = UploadTraceToOsmUI.createDefault(
                            description.GetValue().data,
                            "Track created with MapComplete with theme " + state?.layout?.id
                        )
                        await state?.osmConnection?.uploadGpxTrack(trace(title.GetValue().data), {
                            visibility: dropdown.GetValue().data,
                            description: descriptionStr,
                            filename: titleStr + ".gpx",
                            labels: ["MapComplete", state?.layout?.id],
                        })

                        if (options?.whenUploaded !== undefined) {
                            await options.whenUploaded()
                        }
                        uploadFinished.setData(true)
                    }
                ),
            ]).SetClass("flex flex-wrap flex-wrap-reverse justify-between items-stretch"),
        ]).SetClass("flex flex-col p-4 rounded border-2 m-2 border-subtle")

        super(
            new Toggle(
                new Toggle(
                    new Combine([
                        Svg.confirm_svg().SetClass("w-12 h-12 mr-2"),
                        t.uploadFinished,
                    ]).SetClass("flex p-2 rounded-xl border-2 subtle-border items-center"),
                    new Toggle(
                        confirmPanel,
                        new SubtleButton(new SvelteUIElement(Upload), t.title)
                            .onClick(() => clicked.setData(true))
                            .SetClass("w-full"),
                        clicked
                    ),
                    uploadFinished
                ),
                new Combine([
                    Svg.invalid_svg().SetClass("w-8 h-8 m-2"),
                    t.gpxServiceOffline.SetClass("p-2"),
                ]).SetClass("flex border alert items-center"),
                state.osmConnection.gpxServiceIsOnline.map(
                    (serviceState) => serviceState === "online"
                )
            ),
            undefined,
            state
        )
    }

    private static createDefault(s: string, defaultValue: string) {
        if (defaultValue.length < 1) {
            throw "Default value should have some characters"
        }
        if (s === undefined || s === null || s === "") {
            return defaultValue
        }
        return s
    }
}
