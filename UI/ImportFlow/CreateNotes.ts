import Combine from "../Base/Combine";
import {OsmConnection} from "../../Logic/Osm/OsmConnection";
import {UIEventSource} from "../../Logic/UIEventSource";
import Title from "../Base/Title";
import Toggle from "../Input/Toggle";
import Loading from "../Base/Loading";
import {VariableUiElement} from "../Base/VariableUIElement";
import {FixedUiElement} from "../Base/FixedUiElement";
import {SubtleButton} from "../Base/SubtleButton";
import Svg from "../../Svg";
import Translations from "../i18n/Translations";

export class CreateNotes extends Combine {
    
    public static createNoteContents(feature: {properties: any, geometry: {coordinates: [number,number]}},
                                     options: {wikilink: string; intro: string; source: string, theme: string }
                                     ): string[]{
        const src = feature.properties["source"] ?? feature.properties["src"] ?? options.source
        delete feature.properties["source"]
        delete feature.properties["src"]
        let extraNote = ""
        if (feature.properties["note"]) {
            extraNote = feature.properties["note"] + "\n"
            delete feature.properties["note"]
        }

        const tags: string [] = []
        for (const key in feature.properties) {
            if (feature.properties[key] === null || feature.properties[key] === undefined) {
                console.warn("Null or undefined key for ", feature.properties)
                continue
            }
            if (feature.properties[key] === "") {
                continue
            }
            tags.push(key + "=" + (feature.properties[key]+"").replace(/=/, "\\=").replace(/;/g, "\\;").replace(/\n/g, "\\n"))
        }
        const lat = feature.geometry.coordinates[1]
        const lon = feature.geometry.coordinates[0]
        const note = Translations.t.importHelper.noteParts
        return [
            options.intro,
            extraNote,
            note.datasource.Subs({source: src}).txt,
            note.wikilink.Subs(options).txt,
            '',
            note.importEasily.txt,
            `https://mapcomplete.osm.be/${options.theme}.html?z=18&lat=${lat}&lon=${lon}#import`,
            ...tags]
    }

    constructor(state: { osmConnection: OsmConnection }, v: { features: any[]; wikilink: string; intro: string; source: string, theme: string }) {
        const t = Translations.t.importHelper.createNotes;
        const createdNotes: UIEventSource<number[]> = new UIEventSource<number[]>([])
        const failed = new UIEventSource<string[]>([])
        const currentNote = createdNotes.map(n => n.length)

        for (const f of v.features) {
            
            const lat = f.geometry.coordinates[1]
            const lon = f.geometry.coordinates[0]
            const text = CreateNotes.createNoteContents(f, v).join("\n")

            state.osmConnection.openNote(
                lat, lon, text)
                .then(({id}) => {
                    createdNotes.data.push(id)
                    createdNotes.ping()
                }, err => {
                    failed.data.push(err)
                    failed.ping()
                })
        }

        super([
            new Title(t.title),
           t.loading           ,
            new Toggle(
                new Loading(new VariableUiElement(currentNote.map(count => t.creating.Subs({
                    count, total: v.features.length
                    }
                    
                )))),
                new Combine([
                    Svg.party_svg().SetClass("w-24"),
                    t.done.Subs(v.features.length).SetClass("thanks"),
                        new SubtleButton(Svg.note_svg(), 
                           t.openImportViewer , {
                            url: "import_viewer.html"
                        })
                    ]
                ),
                currentNote.map(count => count < v.features.length)
            ),
            new VariableUiElement(failed.map(failed => {

                if (failed.length === 0) {
                    return undefined
                }
                return new Combine([
                    new FixedUiElement("Some entries failed").SetClass("alert"),
                    ...failed
                ]).SetClass("flex flex-col")

            }))
        ])
        this.SetClass("flex flex-col");
    }

}