import Combine from "../Base/Combine";
import Toggle from "../Input/Toggle";
import LanguagePicker from "../LanguagePicker";
import UserRelatedState from "../../Logic/State/UserRelatedState";
import BaseUIElement from "../BaseUIElement";
import MinimapImplementation from "../Base/MinimapImplementation";
import Translations from "../i18n/Translations";
import {FlowPanelFactory} from "./FlowStep";
import {RequestFile} from "./RequestFile";
import {PreviewPanel} from "./PreviewPanel";
import ConflationChecker from "./ConflationChecker";
import {AskMetadata} from "./AskMetadata";
import LayerConfig from "../../Models/ThemeConfig/LayerConfig";
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

export default class ImportHelperGui extends LeftIndex {
    constructor() {
        const state = new UserRelatedState(undefined)

        const {flow, furthestStep, titles} =
            FlowPanelFactory
                .start("Introduction", new Introdution())
                .then("Login", _ => new LoginToImport(state))
                .then("Select file", _ => new RequestFile())
                .then("Inspect attributes", geojson => new PreviewPanel(state, geojson))
                .then("Inspect data", geojson => new MapPreview(state, geojson))
                .then("Compare with open notes", v => new CompareToAlreadyExistingNotes(state, v))
                .then("Compare with existing data", v => new ConflationChecker(state, v))
                .then("License and community check", v => new ConfirmProcess(v))
                .then("Metadata", (v: { features: any[], layer: LayerConfig }) => new AskMetadata(v))
                .finish("Note creation", v => new CreateNotes(state, v));

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
            new SubtleButton(undefined, "Inspect your preview imports", {
                url: "import_viewer.html"
            }),
            toc,
            new Toggle(new FixedUiElement("Testmode - won't actually import notes").SetClass("alert"), undefined, state.featureSwitchIsTesting),
            LanguagePicker.CreateLanguagePicker(Translations.t.importHelper.title.SupportedLanguages())?.SetClass("mt-4 self-end flex-col"),
        ].map(el => el?.SetClass("pl-4"))

        super(
            leftContents,
            flow)

    }

}

MinimapImplementation.initialize()
new ImportHelperGui().AttachTo("main")