import {FixedUiElement} from "./Base/FixedUiElement";
import {LoginToggle} from "./Popup/LoginButton";
import {OsmConnection} from "../Logic/Osm/OsmConnection";
import UserRelatedState from "../Logic/State/UserRelatedState";
import Combine from "./Base/Combine";
import BackToIndex from "./BigComponents/BackToIndex";
import BaseUIElement from "./BaseUIElement";
import TableOfContents from "./Base/TableOfContents";
import LanguagePicker from "./LanguagePicker";
import Translations from "./i18n/Translations";
import Constants from "../Models/Constants";
import Toggle from "./Input/Toggle";
import MoreScreen from "./BigComponents/MoreScreen";
import Title from "./Base/Title";

export default class ImportHelperGui extends LoginToggle{

    constructor() {
        const t = Translations.t.importHelper;
        
        const state = new UserRelatedState(undefined)

        const leftContents: BaseUIElement[] = [
            new BackToIndex().SetClass("block pl-4"),
            LanguagePicker.CreateLanguagePicker(Translations.t.importHelper.title.SupportedLanguages())?.SetClass("mt-4 self-end flex-col"),
        ].map(el => el?.SetClass("pl-4"))

        const leftBar = new Combine([
            new Combine(leftContents).SetClass("sticky top-4 m-4")
        ]).SetClass("block w-full md:w-2/6 lg:w-1/6")
        
        
        super(
            
            new Toggle(
            new Combine([
                leftBar,
                new Combine([
                    new Title(t.title,1),
                    t.description
                ]).SetClass("flex flex-col m-8")
            ]).SetClass("block md:flex")
            
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


new ImportHelperGui().AttachTo("main")