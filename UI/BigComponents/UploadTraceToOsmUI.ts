import Toggle from "../Input/Toggle";
import {RadioButton} from "../Input/RadioButton";
import {FixedInputElement} from "../Input/FixedInputElement";
import Combine from "../Base/Combine";
import Translations from "../i18n/Translations";
import {TextField} from "../Input/TextField";
import {UIEventSource} from "../../Logic/UIEventSource";
import Title from "../Base/Title";
import {SubtleButton} from "../Base/SubtleButton";
import Svg from "../../Svg";
import {OsmConnection} from "../../Logic/Osm/OsmConnection";
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig";
import {Translation} from "../i18n/Translation";


export default class UploadTraceToOsmUI extends Toggle {


    constructor(
        trace: () => string,
        state: {
            layoutToUse: LayoutConfig;
            osmConnection: OsmConnection
        }, options?: {
            whenUploaded?: () => void | Promise<void>
        }) {
        const t = Translations.t.general.uploadGpx

        const traceVisibilities: {
            key: "private" | "public",
            name: Translation,
            docs: Translation
        }[] = [
            {
                key: "private",
                ...Translations.t.general.uploadGpx.modes.private
            },
            {
                key: "public",
                ...Translations.t.general.uploadGpx.modes.public
            }
        ]

        const dropdown = new RadioButton<"private" | "public">(
            traceVisibilities.map(tv => new FixedInputElement<"private" | "public">(
                new Combine([Translations.W(
                    tv.name
                ).SetClass("font-bold"), tv.docs]).SetClass("flex flex-col")
                , tv.key)),
            {
                value: <any>state?.osmConnection?.GetPreference("gps.trace.visibility")
            }
        )
        const description = new TextField({
            placeholder: t.placeHolder
        })
        const clicked = new UIEventSource<boolean>(false)

        const confirmPanel = new Combine([
            new Title(t.title),
            t.intro0,
            t.intro1,

            t.choosePermission,
            dropdown,
            new Title(t.description.title, 4),
            t.description.intro,
            description,
            new Combine([
                new SubtleButton(Svg.close_svg(), Translations.t.general.cancel).onClick(() => {
                    clicked.setData(false)
                }).SetClass(""),
                new SubtleButton(Svg.upload_svg(), t.confirm).OnClickWithLoading(t.uploading, async () => {
                    await state?.osmConnection?.uploadGpxTrack(trace(), {
                        visibility: dropdown.GetValue().data,
                        description: description.GetValue().data,
                        labels: ["MapComplete", state?.layoutToUse?.id]
                    })

                    if (options?.whenUploaded !== undefined) {
                        await options.whenUploaded()
                    }

                }).SetClass("")
            ]).SetClass("flex flex-wrap flex-wrap-reverse justify-between items-stretch")
        ]).SetClass("flex flex-col p-4 rounded border-2 m-2 border-subtle")


        super(
            confirmPanel,
            new SubtleButton(Svg.upload_svg(), t.title)
                .onClick(() => clicked.setData(true)),
            clicked
        )
    }
}