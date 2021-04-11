import {UIElement} from "../UIElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import {InputElement} from "../Input/InputElement";
import SingleSetting from "./SingleSetting";
import SettingsTable from "./SettingsTable";
import {TextField} from "../Input/TextField";
import Combine from "../Base/Combine";
import MultiLingualTextFields from "../Input/MultiLingualTextFields";
import AndOrTagInput from "../Input/AndOrTagInput";
import {MultiTagInput} from "../Input/MultiTagInput";
import {MultiInput} from "../Input/MultiInput";
import MappingInput from "./MappingInput";
import {AndOrTagConfigJson} from "../../Customizations/JSON/TagConfigJson";
import {TagRenderingConfigJson} from "../../Customizations/JSON/TagRenderingConfigJson";
import UserDetails from "../../Logic/Osm/OsmConnection";
import {VariableUiElement} from "../Base/VariableUIElement";
import ValidatedTextField from "../Input/ValidatedTextField";
import SpecialVisualizations from "../SpecialVisualizations";
import TagRenderingConfig from "../../Customizations/JSON/TagRenderingConfig";
import Constants from "../../Models/Constants";

export default class TagRenderingPanel extends InputElement<TagRenderingConfigJson> {

    public IsImage = false;
    public options: { title?: string; description?: string; disableQuestions?: boolean; isImage?: boolean; };
    public readonly validText: UIElement;
    IsSelected: UIEventSource<boolean> = new UIEventSource<boolean>(false);
    private intro: UIElement;
    private settingsTable: UIElement;
    private readonly _value: UIEventSource<TagRenderingConfigJson>;

    constructor(languages: UIEventSource<string[]>,
                currentlySelected: UIEventSource<SingleSetting<any>>,
                userDetails: UserDetails,
                options?: {
                    title?: string,
                    description?: string,
                    disableQuestions?: boolean,
                    isImage?: boolean,
                    noLanguage?: boolean
                }) {
        super();

        this.SetClass("bordered");
        this.SetClass("min-height");

        this.options = options ?? {};
        const questionsNotUnlocked = userDetails.csCount < Constants.userJourney.themeGeneratorFullUnlock;
        this.options.disableQuestions =
            (this.options.disableQuestions ?? false) ||
            questionsNotUnlocked;

        this.intro = new Combine(["<h3>", options?.title ?? "TagRendering", "</h3>",
            options?.description ?? "A tagrendering converts OSM-tags into a value on screen. Fill out the field 'render' with the text that should appear. Note that `{key}` will be replaced with the corresponding `value`, if present.<br/>For specific known tags (e.g. if `foo=bar`, make a mapping).  "])
        this.IsImage = options?.isImage ?? false;

        const value = new UIEventSource<TagRenderingConfigJson>({});
        this._value = value;

        function setting(input: InputElement<any>, id: string | string[], name: string, description: string | UIElement): SingleSetting<any> {
            return new SingleSetting<any>(value, input, id, name, description);
        }

        this._value.addCallback(value => {
            let doPing = false;
            if (value?.freeform?.key == "") {
                value.freeform = undefined;
                doPing = true;
            }

            if (value?.render == "") {
                value.render = undefined;
                doPing = true;
            }

            if (doPing) {
                this._value.ping();
            }
        })

        const questionSettings = [


            setting(options?.noLanguage ? new TextField({placeholder: "question"}) : new MultiLingualTextFields(languages)
                , "question", "Question", "If the key or mapping doesn't match, this question is asked"),

            "<h3>Freeform key</h3>",
            setting(ValidatedTextField.KeyInput(true), ["freeform", "key"], "Freeform key<br/>",
                "If specified, the rendering will search if this key is present." +
                "If it is, the rendering above will be used to display the element.<br/>" +
                "The rendering will go into question mode if <ul><li>this key is not present</li><li>No single mapping matches</li><li>A question is given</li>"),

            setting(ValidatedTextField.TypeDropdown(), ["freeform", "type"], "Freeform type",
                "The type of this freeform text field, in order to validate"),
            setting(new MultiTagInput(), ["freeform", "addExtraTags"], "Extra tags on freeform",
                "When the freeform text field is used, the user might mean a predefined key. This field allows to add extra tags, e.g. <span class='literal-code'>fixme=User used a freeform field - to check</span>"),

        ];

        const settings: (string | SingleSetting<any>)[] = [
            setting(
                options?.noLanguage ? new TextField({placeholder: "Rendering"}) :
                    new MultiLingualTextFields(languages), "render", "Value to show",
                "Renders this value. Note that <span class='literal-code'>{key}</span>-parts are substituted by the corresponding values of the element. If neither 'textFieldQuestion' nor 'mappings' are defined, this text is simply shown as default value." +
                "<br/><br/>" +
                "Furhtermore, some special functions are supported:" + SpecialVisualizations.HelpMessage.Render()),

            questionsNotUnlocked ? `You need at least ${Constants.userJourney.themeGeneratorFullUnlock} changesets to unlock the 'question'-field and to use your theme to edit OSM data` : "",
            ...(options?.disableQuestions ? [] : questionSettings),

            "<h3>Mappings</h3>",
            setting(new MultiInput<{ if: AndOrTagConfigJson, then: (string | any), hideInAnswer?: boolean }>("Add a mapping",
                () => ({if: {and: []}, then: {}}),
                () => new MappingInput(languages, options?.disableQuestions ?? false),
                undefined, {allowMovement: true}), "mappings",
                "If a tag matches, then show the first respective text", ""),

            "<h3>Condition</h3>",
            setting(new AndOrTagInput(), "condition", "Only show this tagrendering if the following condition applies",
                "Only show this tag rendering if these tags matches. Optional field.<br/>Note that the Overpass-tags are already always included in this object"),


        ];

        this.settingsTable = new SettingsTable(settings, currentlySelected);


        this.validText = new VariableUiElement(value.map((json: TagRenderingConfigJson) => {
            try {
                new TagRenderingConfig(json, undefined, options?.title ?? "");
                return "";
            } catch (e) {
                return "<span class='alert'>" + e + "</span>"
            }
        }));

    }

    InnerRender(): string {
        return new Combine([
            this.intro,
            this.settingsTable,
            this.validText]).Render();
    }

    GetValue(): UIEventSource<TagRenderingConfigJson> {
        return this._value;
    }

    IsValid(t: TagRenderingConfigJson): boolean {
        return false;
    }


}