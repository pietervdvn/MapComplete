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
import FilteredLayer from "../../Models/FilteredLayer";

export default class NewNoteUi extends Toggle {

    constructor(noteLayer: FilteredLayer,
                isShown: UIEventSource<boolean>,
                state: {
                    LastClickLocation: UIEventSource<{ lat: number, lon: number }>,
                    osmConnection: OsmConnection, 
                    layoutToUse: LayoutConfig, 
                    featurePipeline: FeaturePipeline,
                    selectedElement: UIEventSource<any>
                }) {

        const t = Translations.t.notes;
        const isCreated = new UIEventSource(false);
        state.LastClickLocation.addCallbackAndRun(_ => isCreated.setData(false)) // Reset 'isCreated' on every click
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
            const loc = state.LastClickLocation.data;
            const id = await state?.osmConnection?.openNote(loc.lat, loc.lon, txt)
            const feature = {
                type:"Feature",
                geometry:{
                    type:"Point",
                    coordinates: [loc.lon, loc.lat]
                },
                properties: {
                    id: ""+id.id,
                    date_created: new Date().toISOString(),
                    _first_comment : txt,
                    comments:JSON.stringify( [{
                        text: txt,
                        html: txt,
                        user: state.osmConnection?.userDetails?.data?.name,
                        uid: state.osmConnection?.userDetails?.data?.uid
                    }]),
                },
            };
            state?.featurePipeline?.InjectNewPoint(feature)
            state.selectedElement?.setData(feature)
            text.GetValue().setData("")
            isCreated.setData(true)
        })
        const createNoteDialog = new Combine([
            new Title(t.createNoteTitle),
            t.createNoteIntro,
            text,
            new Combine([new Toggle(undefined, t.warnAnonymous.SetClass("alert"), state?.osmConnection?.isLoggedIn), 
                new Toggle(postNote,
                    t.textNeeded.SetClass("alert"),
                    text.GetValue().map(txt => txt.length > 3)
                    )
            
            ]).SetClass("flex justify-end items-center")
        ]).SetClass("flex flex-col border-2 border-black rounded-xl p-4");


        const newNoteUi = new Toggle(
            new Toggle(t.isCreated.SetClass("thanks"),
                createNoteDialog,
                isCreated
            ),
            undefined,
            new UIEventSource<boolean>(true)
        )

        super(
            new Toggle(
                new Combine(
                    [
                        t.noteLayerHasFilters.SetClass("alert"),
                        new SubtleButton(Svg.filter_svg(), t.disableAllNoteFilters).onClick(() => {
                            const filters = noteLayer.appliedFilters.data;
                            for (const key of Array.from(filters.keys())) {
                                filters.set(key, undefined)
                            }
                            noteLayer.appliedFilters.ping()
                            isShown.setData(false);
                        })
                    ]
                ).SetClass("flex flex-col"),
                newNoteUi,
                noteLayer.appliedFilters.map(filters => Array.from(filters.values()).some(v => v !== undefined))
            ),
            new Combine([
                t.noteLayerNotEnabled.SetClass("alert"),
                new SubtleButton(Svg.layers_svg(), t.noteLayerDoEnable).onClick(() => {
                    noteLayer.isDisplayed.setData(true);
                    isShown.setData(false);
                })
            ]).SetClass("flex flex-col"),
            noteLayer.isDisplayed
        );
    }


}
