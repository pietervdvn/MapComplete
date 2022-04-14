import Combine from "../Base/Combine";
import Toggle from "../Input/Toggle";
import LanguagePicker from "../LanguagePicker";
import UserRelatedState from "../../Logic/State/UserRelatedState";
import BaseUIElement from "../BaseUIElement";
import MinimapImplementation from "../Base/MinimapImplementation";
import Translations from "../i18n/Translations";
import {FlowPanelFactory} from "./FlowStep";
import {RequestFile} from "./RequestFile";
import {PreviewAttributesPanel} from "./PreviewPanel";
import ConflationChecker from "./ConflationChecker";
import {AskMetadata} from "./AskMetadata";
import {ConfirmProcess} from "./ConfirmProcess";
import {CreateNotes} from "./CreateNotes";
import {FixedUiElement} from "../Base/FixedUiElement";
import {VariableUiElement} from "../Base/VariableUIElement";
import List from "../Base/List";
import {CompareToAlreadyExistingNotes} from "./CompareToAlreadyExistingNotes";
import Introdution from "./Introdution";
import LoginToImport from "./LoginToImport";
import {MapPreview} from "./MapPreview";
import LeftIndex from "../Base/LeftIndex";
import {SubtleButton} from "../Base/SubtleButton";
import SelectTheme from "./SelectTheme";

export default class ImportHelperGui extends LeftIndex {
    constructor() {
        const state = new UserRelatedState(undefined)
        const t =  Translations.t.importHelper;
        const {flow, furthestStep, titles} =
            FlowPanelFactory
                .start(t.introduction, new Introdution())
                .then(t.login, _ => new LoginToImport(state))
               .then(t.selectFile, _ => new RequestFile())
               .then(t.previewAttributes, geojson => new PreviewAttributesPanel(state, geojson))
               .then(t.mapPreview, geojson => new MapPreview(state, geojson))
               .then(t.selectTheme, v => new SelectTheme(v))
               .then(t.compareToAlreadyExistingNotes, v => new CompareToAlreadyExistingNotes(state, v))
               .then("Compare with existing data", v => new ConflationChecker(state, v))
               .then(t.confirmProcess, v  => new ConfirmProcess(v))
               .then(t.askMetadata, (v) => new AskMetadata(v))
               .finish(t.createNotes.title, v => new CreateNotes(state, v));

        const toc = new List(
            titles.map((title, i) => new VariableUiElement(furthestStep.map(currentStep => {
                if (i > currentStep) {
                    return new Combine([title]).SetClass("subtle");
                }
                if (i == currentStep) {
                    return new Combine([title]).SetClass("font-bold");
                }
                if (i < currentStep) {
                    return title
                }


            })))
            , true)

        const leftContents: BaseUIElement[] = [
            new SubtleButton(undefined, t.gotoImportViewer, {
                url: "import_viewer.html"
            }),
            toc,
            new Toggle(t.testMode.SetClass("block alert"), undefined, state.featureSwitchIsTesting),
            LanguagePicker.CreateLanguagePicker(Translations.t.importHelper.title.SupportedLanguages())?.SetClass("mt-4 self-end flex-col"),
        ].map(el => el?.SetClass("pl-4"))

        super(
            leftContents,
            flow)

    }

}

MinimapImplementation.initialize()
new ImportHelperGui().AttachTo("main")