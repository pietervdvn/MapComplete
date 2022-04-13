import Combine from "../Base/Combine";
import {FlowStep} from "./FlowStep";
import {UIEventSource} from "../../Logic/UIEventSource";
import Translations from "../i18n/Translations";
import Title from "../Base/Title";

export default class Introdution extends Combine implements FlowStep<void> {
    readonly IsValid: UIEventSource<boolean> = new UIEventSource<boolean>(true);
    readonly Value: UIEventSource<void> = new UIEventSource<void>(undefined);

    constructor() {
        super([
            new Title(Translations.t.importHelper.introduction.title),
            Translations.t.importHelper.introduction.description,
            Translations.t.importHelper.introduction.importFormat,
        ]);
        this.SetClass("flex flex-col")
    }

}