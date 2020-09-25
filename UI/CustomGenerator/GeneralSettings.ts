import {UIElement} from "../UIElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import {LayoutConfigJson} from "../../Customizations/JSON/LayoutConfigJson";
import Combine from "../Base/Combine";
import SettingsTable from "./SettingsTable";
import SingleSetting from "./SingleSetting";
import {TextField} from "../Input/TextField";
import MultiLingualTextFields from "../Input/MultiLingualTextFields";
import ValidatedTextField from "../Input/ValidatedTextField";


export default class GeneralSettingsPanel extends UIElement {
    private panel: Combine;
    
    public languages : UIEventSource<string[]>;

    constructor(configuration: UIEventSource<LayoutConfigJson>, currentSetting: UIEventSource<SingleSetting<any>>) {
        super(undefined);


        const languagesField =
            ValidatedTextField.Mapped(
                str => {
                    console.log("Language from str", str);
                    return str?.split(";")?.map(str => str.trim().toLowerCase());
                },
                languages => languages.join(";"));
        this.languages = languagesField.GetValue();

        const version = new TextField();
        const current_datetime = new Date();
        let formatted_date = current_datetime.getFullYear() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getDate() + " " + current_datetime.getHours() + ":" + current_datetime.getMinutes() + ":" + current_datetime.getSeconds()
        version.GetValue().setData(formatted_date);
        
        
        const locationRemark = "<br/>Note that, as soon as an URL-parameter sets the location or a location is known due to a previous visit, that the theme-set location is ignored"

        const settingsTable = new SettingsTable(
            [
                new SingleSetting(configuration, new TextField({placeholder:"id"}), "id",
                    "Identifier", "The identifier of this theme. This should be a lowercase, unique string"),
                new SingleSetting(configuration, version, "version", "Version",
                    "A version to indicate the theme version. Ideal is the date you created or updated the theme"),
                new SingleSetting(configuration, languagesField, "language",
                    "Supported languages", "Which languages do you want to support in this theme? Type the two letter code representing your language, seperated by <span class='literal-code'>;</span>. For example:<span class='literal-code'>en;nl</span> "),
                new SingleSetting(configuration, new MultiLingualTextFields(this.languages), "title",
                    "Title", "The title as shown in the welcome message, in the browser title bar, in the more screen, ..."),
               new SingleSetting(configuration, new MultiLingualTextFields(this.languages), "shortDescription","Short description",
                   "The short description is shown as subtext in the social preview and on the 'more screen'-buttons. It should be at most one sentence of around ~25words"),
                new SingleSetting(configuration, new MultiLingualTextFields(this.languages, true),
                    "description", "Description", "The description is shown in the welcome-message when opening MapComplete. It is a small text welcoming users"),
                new SingleSetting(configuration, new TextField({placeholder: "URL to icon"}), "icon",
                    "Icon", "A visual representation for your theme; used as logo in the welcomeMessage. If your theme is official, used as favicon and webapp logo",
                    {
                        showIconPreview: true
                    }),
                
                new SingleSetting(configuration, ValidatedTextField.NumberInput("nat", n => n < 23), "startZoom","Initial zoom level",
                    "When a user first loads MapComplete, this zoomlevel is shown."+locationRemark),
                new SingleSetting(configuration, ValidatedTextField.NumberInput("float", n => (n < 90 && n > -90)), "startLat","Initial latitude",
                    "When a user first loads MapComplete, this latitude is shown as location."+locationRemark),
                new SingleSetting(configuration, ValidatedTextField.NumberInput("float", n => (n < 180 && n > -180)), "startLon","Initial longitude",
                    "When a user first loads MapComplete, this longitude is shown as location."+locationRemark),
            
                new SingleSetting(configuration, ValidatedTextField.NumberInput("pfloat", n => (n < 0.5 )), "widenFactor","Query widening",
                    "When a query is run, the data within bounds of the visible map is loaded.\n" +
                    "However, users tend to pan and zoom a lot. It is pretty annoying if every single pan means a reloading of the data.\n" +
                    "For this, the bounds are widened in order to make a small pan still within bounds of the loaded data.\n" +
                    "IF widenfactor is 0, this feature is disabled. A recommended value is between 0.5 and 0.01 (the latter for very dense queries)"),

                new SingleSetting(configuration, new TextField({placeholder: "URL to social image"}), "socialImage",
                "og:image (aka Social Image)", "<span class='alert'>Only works on incorporated themes</span>" +
                    "The Social Image is set as og:image for the HTML-site and helps social networks to show a preview", {showIconPreview: true})
            ], currentSetting);

        this.panel = new Combine([
            "<h3>General theme settings</h3>",
            settingsTable
        ]);
    }


    InnerRender(): string {
        return this.panel.Render();
    }


}