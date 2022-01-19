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
import {FlowPanel, FlowPanelFactory} from "./FlowStep";
import {RequestFile} from "./RequestFile";
import {DataPanel} from "./DataPanel";
import {FixedUiElement} from "../Base/FixedUiElement";
import ConflationChecker from "./ConflationChecker";

export default class ImportHelperGui extends LoginToggle {
    constructor() {
        const t = Translations.t.importHelper;

        const state = new UserRelatedState(undefined)

        // We disable the userbadge, as various 'showData'-layers will give a read-only view in this case
        state.featureSwitchUserbadge.setData(false)

        const leftContents: BaseUIElement[] = [
            new BackToIndex().SetClass("block pl-4"),
            LanguagePicker.CreateLanguagePicker(Translations.t.importHelper.title.SupportedLanguages())?.SetClass("mt-4 self-end flex-col"),
        ].map(el => el?.SetClass("pl-4"))

        const leftBar = new Combine([
            new Combine(leftContents).SetClass("sticky top-4 m-4")
        ]).SetClass("block w-full md:w-2/6 lg:w-1/6")


        const mainPanel = 
            FlowPanelFactory
                .start(new RequestFile())
                .then("datapanel", geojson => new DataPanel(state, geojson))
                .then("conflation", v => new ConflationChecker(state, v))
                .finish(_ => new FixedUiElement("All done!"))
        
        super(
            new Toggle(
                new Combine([
                    leftBar,
                    mainPanel.SetClass("m-8 w-full mb-24")
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