import {UIElement} from "../UIElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import {InputElement} from "../Input/InputElement";
import SingleSetting from "./SingleSetting";
import SettingsTable from "./SettingsTable";
import {TextField, ValidatedTextField} from "../Input/TextField";
import Combine from "../Base/Combine";
import MultiLingualTextFields from "../Input/MultiLingualTextFields";
import {AndOrTagInput} from "../Input/AndOrTagInput";
import {MultiTagInput} from "../Input/MultiTagInput";
import {MultiInput} from "../Input/MultiInput";
import MappingInput from "./MappingInput";
import {AndOrTagConfigJson} from "../../Customizations/JSON/TagConfigJson";
import {TagRenderingConfigJson} from "../../Customizations/JSON/TagRenderingConfigJson";
import {UserDetails} from "../../Logic/Osm/OsmConnection";
import {State} from "../../State";

export default class TagRenderingPanel extends InputElement<TagRenderingConfigJson> {

    private intro: UIElement;
    private settingsTable: UIElement;

    public IsImage = false;
    private readonly _value: UIEventSource<TagRenderingConfigJson>;
    public options: { title?: string; description?: string; disableQuestions?: boolean; isImage?: boolean; };

    constructor(languages: UIEventSource<string[]>,
                currentlySelected: UIEventSource<SingleSetting<any>>,
                userDetails: UserDetails,
                options?: {
                    title?: string,
                    description?: string,
                    disableQuestions?: boolean,
                    isImage?: boolean
                }) {
        super();

        this.SetClass("bordered");
        this.SetClass("min-height");

        this.options = options ?? {};
        const questionsNotUnlocked = userDetails.csCount < State.userJourney.themeGeneratorFullUnlock;
        this.options.disableQuestions = 
            (this.options.disableQuestions ?? false) ||
            questionsNotUnlocked; 

        this.intro = new Combine(["<h3>", options?.title ?? "TagRendering", "</h3>", options?.description ?? ""])
        this.IsImage = options?.isImage ?? false;

        const value = new UIEventSource<TagRenderingConfigJson>({});
        this._value = value;

        function setting(input: InputElement<any>, id: string | string[], name: string, description: string | UIElement): SingleSetting<any> {
            return new SingleSetting<any>(value, input, id, name, description);
        }

        const questionSettings = [

            
            setting(new MultiLingualTextFields(languages), "question", "Question", "If the key or mapping doesn't match, this question is asked"),

            setting(new AndOrTagInput(), "condition", "Condition",
                "Only show this tag rendering if these tags matches. Optional field.<br/>Note that the Overpass-tags are already always included in this object"),

            "<h3>Freeform key</h3>",
            setting(TextField.KeyInput(true), ["freeform", "key"], "Freeform key<br/>",
                "If specified, the rendering will search if this key is present." +
                "If it is, the rendering above will be used to display the element.<br/>" +
                "The rendering will go into question mode if <ul><li>this key is not present</li><li>No single mapping matches</li><li>A question is given</li>"),

            setting(ValidatedTextField.TypeDropdown(), ["freeform", "type"], "Freeform type",
                "The type of this freeform text field, in order to validate"),
            setting(new MultiTagInput(), ["freeform", "addExtraTags"], "Extra tags on freeform",
                "When the freeform text field is used, the user might mean a predefined key. This field allows to add extra tags, e.g. <span class='literal-code'>fixme=User used a freeform field - to check</span>"),

        ];

        const settings: (string | SingleSetting<any>)[] = [
            setting(new MultiLingualTextFields(languages), "render", "Value to show", " Renders this value. Note that <span class='literal-code'>{key}</span>-parts are substituted by the corresponding values of the element. If neither 'textFieldQuestion' nor 'mappings' are defined, this text is simply shown as default value."),
            
            questionsNotUnlocked ? `You need at least ${State.userJourney.themeGeneratorFullUnlock} changesets to unlock the 'question'-field and to use your theme to edit OSM data`: "",
            ...(options?.disableQuestions ? [] : questionSettings),

            "<h3>Mappings</h3>",
            setting(new MultiInput<{ if: AndOrTagConfigJson, then: (string | any), hideInAnswer?: boolean }>("Add a mapping",
                () => ({if: undefined, then: undefined}),
                () => new MappingInput(languages, options?.disableQuestions ?? false)), "mappings",
                "Mappings", "")

        ];

        this.settingsTable = new SettingsTable(settings, currentlySelected);
    }

    InnerRender(): string {
        return new Combine([
            this.intro,
            this.settingsTable]).Render();
    }

    GetValue(): UIEventSource<TagRenderingConfigJson> {
        return this._value;
    }

    IsSelected: UIEventSource<boolean> = new UIEventSource<boolean>(false);

    IsValid(t: TagRenderingConfigJson): boolean {
        return false;
    }


}