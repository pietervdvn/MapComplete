import Combine from "../Base/Combine";
import {FlowStep} from "./FlowStep";
import {UIEventSource} from "../../Logic/UIEventSource";
import Translations from "../i18n/Translations";
import Title from "../Base/Title";
import {CreateNotes} from "./CreateNotes";

export default class Introdution extends Combine implements FlowStep<void> {
    readonly IsValid: UIEventSource<boolean>;
    readonly Value: UIEventSource<void>;

    constructor() {
        const example =  CreateNotes.createNoteContents({
            properties:{
                "some_key":"some_value",
                "note":"a note in the original dataset"
            },
            geometry:{
                coordinates: [3.4,51.2]
            }
        }, {
            wikilink: "https://wiki.openstreetmap.org/wiki/Imports/<documentation of your import>",
            intro: "There might be an XYZ here",
            theme: "theme",
            source: "source of the data"
        })
        
        super([
            new Title(Translations.t.importHelper.introduction.title),
            Translations.t.importHelper.introduction.description,
            Translations.t.importHelper.introduction.importFormat,
            new Combine(
                [new Combine(                    
                example
                ).SetClass("flex flex-col")
                ]            ).SetClass("literal-code")
        ]);
        this.SetClass("flex flex-col")
        this. IsValid= new UIEventSource<boolean>(true);
        this. Value = new UIEventSource<void>(undefined);

    }

}