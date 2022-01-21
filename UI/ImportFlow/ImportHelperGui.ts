import Combine from "../Base/Combine";
import {LoginToggle} from "../Popup/LoginButton";
import Toggle from "../Input/Toggle";
import LanguagePicker from "../LanguagePicker";
import BackToIndex from "../BigComponents/BackToIndex";
import UserRelatedState from "../../Logic/State/UserRelatedState";
import BaseUIElement from "../BaseUIElement";
import MoreScreen from "../BigComponents/MoreScreen";
import MinimapImplementation from "../Base/MinimapImplementation";
import Translations from "../i18n/Translations";
import Constants from "../../Models/Constants";
import {FlowPanelFactory} from "./FlowStep";
import {RequestFile} from "./RequestFile";
import {DataPanel} from "./DataPanel";
import ConflationChecker from "./ConflationChecker";
import {AskMetadata} from "./AskMetadata";
import LayerConfig from "../../Models/ThemeConfig/LayerConfig";
import {ConfirmProcess} from "./ConfirmProcess";
import {CreateNotes} from "./CreateNotes";
import {FixedUiElement} from "../Base/FixedUiElement";
import {VariableUiElement} from "../Base/VariableUIElement";
import List from "../Base/List";
import {CompareToAlreadyExistingNotes} from "./CompareToAlreadyExistingNotes";

export default class ImportHelperGui extends LoginToggle {
    constructor() {
        const t = Translations.t.importHelper;

        const state = new UserRelatedState(undefined)

        // We disable the userbadge, as various 'showData'-layers will give a read-only view in this case
        state.featureSwitchUserbadge.setData(false)

        const {flow, furthestStep, titles} =
            FlowPanelFactory
                .start("Select file", new RequestFile())
                .then("Inspect data", geojson => new DataPanel(state, geojson))
                .then("Compare with open notes", v => new CompareToAlreadyExistingNotes(state, v))
                .then("Compare with existing data", v => new ConflationChecker(state, v))
                .then("License and community check", v => new ConfirmProcess(v))
                .then("Metadata", (v:{features:any[], layer: LayerConfig}) => new AskMetadata(v))
                .finish("Note creation", v => new CreateNotes(state, v));
        
        const toc = new List(
            titles.map((title, i) => new VariableUiElement(furthestStep.map(currentStep => {
                if(i > currentStep){
                    return new Combine([title]).SetClass("subtle");
                }
                if(i == currentStep){
                    return new Combine([title]).SetClass("font-bold");
                }
                if(i < currentStep){
                    return title
                }
                
                
            })))
            , true)
        
        const leftContents: BaseUIElement[] = [
            new BackToIndex().SetClass("block pl-4"),
            toc,
            new Toggle(new FixedUiElement("Testmode - won't actually import notes").SetClass("alert"), undefined, state.featureSwitchIsTesting),
            LanguagePicker.CreateLanguagePicker(Translations.t.importHelper.title.SupportedLanguages())?.SetClass("mt-4 self-end flex-col"),
        ].map(el => el?.SetClass("pl-4"))

        const leftBar = new Combine([
            new Combine(leftContents).SetClass("sticky top-4 m-4"),
          ]).SetClass("block w-full md:w-2/6 lg:w-1/6")




        super(
            new Toggle(
                new Combine([
                    leftBar,
                    flow.SetClass("m-8 w-full mb-24")
                ]).SetClass("h-full block md:flex")

                ,
                new Combine([
                    t.lockNotice.Subs(Constants.userJourney),
                    MoreScreen.CreateProffessionalSerivesButton()
                ])

                ,
                state.osmConnection.userDetails.map(ud => ud.csCount >= Constants.userJourney.importHelperUnlock)),

            "Login needed...",
            state)
    }

}

MinimapImplementation.initialize()
new ImportHelperGui().AttachTo("main")