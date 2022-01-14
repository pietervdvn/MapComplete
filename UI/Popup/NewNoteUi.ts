import Combine from "../Base/Combine";
import {UIEventSource} from "../../Logic/UIEventSource";
import {OsmConnection} from "../../Logic/Osm/OsmConnection";
import Translations from "../i18n/Translations";
import Title from "../Base/Title";
import ValidatedTextField from "../Input/ValidatedTextField";
import {SubtleButton} from "../Base/SubtleButton";
import Svg from "../../Svg";
import {LocalStorageSource} from "../../Logic/Web/LocalStorageSource";
import Toggle from "../Input/Toggle";
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig";
import FeaturePipeline from "../../Logic/FeatureSource/FeaturePipeline";

export default class NewNoteUi extends Toggle {

    constructor(lastClickLocation: UIEventSource<{ lat: number, lon: number }>,
                state: { osmConnection: OsmConnection, layoutToUse: LayoutConfig, featurePipeline: FeaturePipeline }) {

        const t = Translations.t.notes;
        const isCreated = new UIEventSource(false);
        const text = ValidatedTextField.InputForType("text", {
            value: LocalStorageSource.Get("note-text")
        })
        text.SetClass("border rounded-sm border-grey-500")

        const postNote = new SubtleButton(Svg.addSmall_svg().SetClass("max-h-7"), t.createNote)
        postNote.onClick(async () => {
            let txt = text.GetValue().data
            if (txt === undefined || txt === "") {
                return;
            }
            txt += "\n\n #MapComplete #" + state?.layoutToUse?.id
            const loc = lastClickLocation.data;
            state?.osmConnection?.openNote(loc.lat, loc.lon, txt)
            text.GetValue().setData("")
            isCreated.setData(true)
        })
        const createNoteDialog = new Combine([
            new Title(t.createNoteTitle),
            t.createNoteIntro,
            text,
            new Combine([new Toggle(undefined, t.warnAnonymous, state?.osmConnection?.isLoggedIn).SetClass("alert"), postNote]).SetClass("flex justify-end items-center")
        ]).SetClass("flex flex-col border-2 border-black rounded-xl p-4");


        super(
            new Toggle(t.isCreated.SetClass("thanks"),
                createNoteDialog,
                isCreated
            ),
            undefined,
            new UIEventSource<boolean>(true)
        )
    }


}
