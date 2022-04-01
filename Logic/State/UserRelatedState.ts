import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig";
import {OsmConnection} from "../Osm/OsmConnection";
import {MangroveIdentity} from "../Web/MangroveReviews";
import {UIEventSource} from "../UIEventSource";
import {QueryParameters} from "../Web/QueryParameters";
import {LocalStorageSource} from "../Web/LocalStorageSource";
import {Utils} from "../../Utils";
import Locale from "../../UI/i18n/Locale";
import ElementsState from "./ElementsState";
import SelectedElementTagsUpdater from "../Actors/SelectedElementTagsUpdater";
import {Changes} from "../Osm/Changes";
import ChangeToElementsActor from "../Actors/ChangeToElementsActor";
import PendingChangesUploader from "../Actors/PendingChangesUploader";
import * as translators from "../../assets/translators.json"
        
/**
 * The part of the state which keeps track of user-related stuff, e.g. the OSM-connection,
 * which layers they enabled, ...
 */
export default class UserRelatedState extends ElementsState {


    /**
     The user credentials
     */
    public osmConnection: OsmConnection;
    /**
     THe change handler
     */
    public changes: Changes;
    /**
     * The key for mangrove
     */
    public mangroveIdentity: MangroveIdentity;
    /**
     * Which layers are enabled in the personal theme
     */
    public favouriteLayers: UIEventSource<string[]>;

    public readonly isTranslator : UIEventSource<boolean>;
    
    constructor(layoutToUse: LayoutConfig, options?: { attemptLogin: true | boolean }) {
        super(layoutToUse);

        this.osmConnection = new OsmConnection({
            dryRun: this.featureSwitchIsTesting,
            fakeUser: this.featureSwitchFakeUser.data,
            oauth_token: QueryParameters.GetQueryParameter(
                "oauth_token",
                undefined,
                "Used to complete the login"
            ),
            osmConfiguration: <'osm' | 'osm-test'>this.featureSwitchApiURL.data,
            attemptLogin: options?.attemptLogin
        })
        this.isTranslator = this.osmConnection.userDetails.map(ud => {
            if(!ud.loggedIn){
                return false;
            }
            const name= ud.name.toLowerCase().replace(/\s+/g, '')
            return translators.contributors.some(c => c.contributor.toLowerCase().replace(/\s+/g, '') === name)
        })
        this.isTranslator.addCallbackAndRunD(ud => {
            if(ud){
                Locale.showLinkToWeblate.setData(true)
            }
        });
        
        QueryParameters.GetBooleanQueryParameter("fs-translation-mode",false,"If set, will show the translation buttons")
            .addCallbackAndRunD(tr => Locale.showLinkToWeblate.setData(Locale.showLinkToWeblate.data || tr))


        this.changes = new Changes(this, layoutToUse?.isLeftRightSensitive() ?? false)


        new ChangeToElementsActor(this.changes, this.allElements)
        new PendingChangesUploader(this.changes, this.selectedElement);
        
        this.mangroveIdentity = new MangroveIdentity(
            this.osmConnection.GetLongPreference("identity", "mangrove")
        );

        if (layoutToUse?.hideFromOverview) {
            this.osmConnection.isLoggedIn.addCallbackAndRunD(loggedIn => {
                if (loggedIn) {
                    this.osmConnection
                        .GetPreference("hidden-theme-" + layoutToUse?.id + "-enabled")
                        .setData("true");
                    return true;
                }
            })
        }

        if (this.layoutToUse !== undefined && !this.layoutToUse.official) {
            console.log("Marking unofficial theme as visited")
            this.osmConnection.GetLongPreference("unofficial-theme-" + this.layoutToUse.id)
                .setData(JSON.stringify({
                    id: this.layoutToUse.id,
                    icon: this.layoutToUse.icon,
                    title: this.layoutToUse.title.translations,
                    shortDescription: this.layoutToUse.shortDescription.translations,
                    definition: this.layoutToUse["definition"]
                }))
        }


        // Important: the favourite layers are initialized _after_ the installed themes, as these might contain an installedTheme
        this.favouriteLayers = LocalStorageSource.Get("favouriteLayers")
            .syncWith(this.osmConnection.GetLongPreference("favouriteLayers"))
            .map(
                (str) => Utils.Dedup(str?.split(";")) ?? [],
                [],
                (layers) => Utils.Dedup(layers)?.join(";")
            );

        this.InitializeLanguage();
        new SelectedElementTagsUpdater(this)

    }

    private InitializeLanguage() {
        const layoutToUse = this.layoutToUse;
        Locale.language.syncWith(this.osmConnection.GetPreference("language"));
        Locale.language
            .addCallback((currentLanguage) => {
                if (layoutToUse === undefined) {
                    return;
                }
                if (this.layoutToUse.language.indexOf(currentLanguage) < 0) {
                    console.log(
                        "Resetting language to",
                        layoutToUse.language[0],
                        "as",
                        currentLanguage,
                        " is unsupported"
                    );
                    // The current language is not supported -> switch to a supported one
                    Locale.language.setData(layoutToUse.language[0]);
                }
            })
            .ping();
    }

}