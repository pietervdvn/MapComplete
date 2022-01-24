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

export class CreateNotes extends Combine {

    constructor(state: { osmConnection: OsmConnection }, v: { features: any[]; wikilink: string; intro: string; source: string, theme: string }) {

        const createdNotes: UIEventSource<number[]> = new UIEventSource<number[]>([])
        const failed = new UIEventSource<string[]>([])
        const currentNote = createdNotes.map(n => n.length)

        for (const f of v.features) {

            const src = f.properties["source"] ?? f.properties["src"] ?? v.source
            delete f.properties["source"]
            delete f.properties["src"]

            const tags: string [] = []
            for (const key in f.properties) {
                if (f.properties[key] === "") {
                    continue
                }
                tags.push(key + "=" + f.properties[key].replace(/=/, "\\=").replace(/;/g, "\\;").replace(/\n/g, "\\n"))
            }
            const lat = f.geometry.coordinates[1]
            const lon = f.geometry.coordinates[0]
            const text = [v.intro,
                '',
                "Source: " + src,
                'More information at ' + v.wikilink,
                '',
                'Import this point easily with',
                `https://mapcomplete.osm.be/${v.theme}.html?z=18&lat=${lat}&lon=${lon}#import`,
                ...tags].join("\n")

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
            new Title("Creating notes"),
            "Hang on while we are importing...",
            new Toggle(
                new Loading(new VariableUiElement(currentNote.map(count => new FixedUiElement("Imported <b>" + count + "</b> out of " + v.features.length + " notes")))),
                new Combine([
                        new FixedUiElement("All done!").SetClass("thanks"),
                        new SubtleButton(Svg.note_svg(), "Inspect the progress of your notes in the 'import_viewer'", {
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