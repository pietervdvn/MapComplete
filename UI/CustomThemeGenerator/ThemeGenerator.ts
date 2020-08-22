import {UIElement} from "../UIElement";
import {VerticalCombine} from "../Base/VerticalCombine";
import {VariableUiElement} from "../Base/VariableUIElement";
import Combine from "../Base/Combine";
import {
    CustomLayoutFromJSON,
    LayerConfigJson,
    LayoutConfigJson,
    TagRenderingConfigJson
} from "../../Customizations/JSON/CustomLayoutFromJSON";
import {TabbedComponent} from "../Base/TabbedComponent";
import {UIEventSource} from "../../Logic/UIEventSource";
import {OsmConnection, UserDetails} from "../../Logic/Osm/OsmConnection";
import {Button} from "../Base/Button";
import {FixedUiElement} from "../Base/FixedUiElement";
import {TextField, ValidatedTextField} from "../Input/TextField";
import {Tag} from "../../Logic/TagsFilter";
import {DropDown} from "../Input/DropDown";
import {TagRendering} from "../../Customizations/TagRendering";
import {LayerDefinition} from "../../Customizations/LayerDefinition";
import {State} from "../../State";


TagRendering.injectFunction();

function TagsToString(tags: string | string [] | { k: string, v: string }[]) {
    if (tags === undefined) {
        return undefined;
    }
    if (typeof (tags) == "string") {
        return tags;
    }
    const newTags = [];
    console.log(tags)
    for (const tag of tags) {
        if (typeof (tag) == "string") {
            newTags.push(tag)
        } else {
            newTags.push(tag.k + "=" + tag.v);
        }
    }
    return newTags.join(",");
}

// Defined below, as it needs some context/closure
let createFieldUI: (label: string, key: string, root: any, options: { deflt?: string, type?: string, description: string, emptyAllowed?: boolean }) => UIElement;


class MappingGenerator extends UIElement {

    private elements: UIElement[];

    constructor(tagRendering: TagRenderingConfigJson,
                mapping: { if: string | string[] | { k: string, v: string }[] }) {
        super(undefined);
        this.CreateElements(tagRendering, mapping)
    }

    private CreateElements(tagRendering: TagRenderingConfigJson,
                           mapping) {
        {
            const self = this;
            this.elements = [
                new FixedUiElement("A mapping shows a specific piece of text if a specific tag is present. If no mapping is known and no key matches (and the question is defined), then the mappings show up as radio buttons to answer the question and to update OSM"),
                createFieldUI("If these tags apply", "if", mapping, {
                    type: "tags",
                    description: "The tags that have to be present. Use <span class='literal-code'>key=</span> to indicate an implicit assumption. 'key=' can be used to indicate: 'if this key is missing'"
                }),
                createFieldUI("Then: show this text", "then", mapping, {description: "The text that is shown"}),
                new Button("Remove this mapping", () => {
                    for (let i = 0; i < tagRendering.mappings.length; i++) {
                        if (tagRendering.mappings[i] === mapping) {
                            tagRendering.mappings.splice(i, 1);
                            self.elements = [
                                new FixedUiElement("Tag mapping removed")
                            ]
                            self.Update();
                            break;
                        }
                    }
                })
            ];
        }
    }

    InnerRender(): string {
        const combine = new VerticalCombine(this.elements);
        combine.clss = "bordered";
        return combine.Render();
    }
}

class TagRenderingGenerator
    extends UIElement {

    private elements: UIElement[];

    constructor(fullConfig: UIEventSource<LayoutConfigJson>,
                layerConfig: LayerConfigJson,
                tagRendering: TagRenderingConfigJson,
                options: { header: string, description: string, removable: boolean, hideQuestion: boolean }) {
        super(undefined);
        this.CreateElements(fullConfig, layerConfig, tagRendering, options)
    }

    private CreateElements(fullConfig: UIEventSource<LayoutConfigJson>, layerConfig: LayerConfigJson, tagRendering: TagRenderingConfigJson,
                           options: { header: string, description: string, removable: boolean, hideQuestion: boolean }) {


        const self = this;
        this.elements = [
            new FixedUiElement(`<h3>${options.header}</h3>`),
            new FixedUiElement(options.description),
            createFieldUI("Key", "key", tagRendering, {
                deflt: "name",
                description: "Optional. If the object contains a tag with the specified key, the rendering below will be shown. Use '*' if you always want to show the rendering."
            }),
            createFieldUI("Rendering", "render", tagRendering, {
                deflt: "The name of this object is {name}",
                description: "Optional. If the above key is present, this rendering will be used. Note that <span class='literal-code'>{key}</span> will be replaced by the value - if that key is present. This is _not_ limited to the given key above, it is allowed to use multiple subsitutions." +
                    "If the above key is _not_ present, the question will be shown and the rendering will be used as answer with {key} as textfield"
            }),
            options.hideQuestion ? new FixedUiElement("") : createFieldUI("Type", "type", tagRendering, {
                deflt: "string",
                description: "Input validation of this type",
                type: "typeSelector",

            }),
            options.hideQuestion ? new FixedUiElement("") :
                createFieldUI("Question", "question", tagRendering, {
                    deflt: "",
                    description: "Optional. If 'key' is not present (or not given) and none of the mappings below match, then this will be shown as question. Users are then able to answer this question and save the data to OSM. If no question is given, values can still be shown but not answered",
                    type: "string"
                }),
            options.hideQuestion ? new FixedUiElement("") :
                createFieldUI("Extra tags", "addExtraTags", tagRendering,
                    {
                        deflt: "",
                        type: "tags",
                        emptyAllowed: true,
                        description: "Optional. If the freeform text field is used to fill out the tag, these tags are applied as well. The main use case is to flag the object for review. (A prime example is access. A few predefined values are given and the option to fill out something. Here, one can add e.g. <span class='literal-code'>fixme=access was filled out by user, value might not be correct</span>"
                    }),

            createFieldUI(
                "Only show if", "condition", tagRendering,
                {
                    deflt: "",
                    type: "tags",
                    emptyAllowed: true,
                    description: "Only show this question/rendering if the object also has the specified tag. This can be useful to ask a follow up question only if the prerequisite is met"
                }
            ),

            ...(tagRendering.mappings ?? []).map((mapping) => {
                return new MappingGenerator(tagRendering, mapping)
            }),
            new Button("Add mapping", () => {
                if (tagRendering.mappings === undefined) {
                    tagRendering.mappings = []
                }
                tagRendering.mappings.push({if: "", then: ""});
                self.CreateElements(fullConfig, layerConfig, tagRendering, options);
                self.Update();
            })

        ]

        if (!!options.removable) {
            const b = new Button("Remove this tag rendering", () => {
                for (let i = 0; i < layerConfig.tagRenderings.length; i++) {
                    if (layerConfig.tagRenderings[i] === tagRendering) {
                        layerConfig.tagRenderings.splice(i, 1);
                        self.elements = [
                            new FixedUiElement("Tag rendering removed")
                        ]
                        self.Update();
                        break;
                    }
                }
            });
            this.elements.push(b);
        }

    }

    InnerRender(): string {
        const combine = new VerticalCombine(this.elements);
        combine.clss = "bordered";
        return combine.Render();
    }
}

class PresetGenerator extends UIElement {

    private elements: UIElement[];

    constructor(fullConfig: UIEventSource<LayoutConfigJson>, layerConfig: LayerConfigJson,
                preset0: { title?: string, description?: string, icon?: string, tags?: string | string[] | { k: string, v: string }[] }) {
        super(undefined);
        const self = this;
        this.elements = [
            new FixedUiElement("<h3>Preset</h3>"),
            new FixedUiElement("A preset allows the user to add a new point at a location that was clicked. Note that one layer can have zero, one or multiple presets"),
            createFieldUI("Title", "title", preset0, {
                description: "The title of this preset, shown in the 'add new {Title} here'-dialog"
            }),
            createFieldUI("Description", "description", preset0,
                {
                    deflt: layerConfig.description,
                    type: "string",
                    description: "A description shown alongside the 'add new'-button"
                }),
            createFieldUI("tags", "tags", preset0,
                {
                    deflt: TagsToString(layerConfig.overpassTags), type: "tags",
                    description: "The tags that are added to the newly created point"
                }),
            new Button("Remove this preset", () => {
                for (let i = 0; i < layerConfig.presets.length; i++) {
                    if (layerConfig.presets[i] === preset0) {
                        layerConfig.presets.splice(i, 1);
                        self.elements = [
                            new FixedUiElement("Preset removed")
                        ]
                        self.Update();
                        break;
                    }
                }
            })
        ]

    }

    InnerRender(): string {
        const combine = new VerticalCombine(this.elements);
        combine.clss = "bordered";
        return combine.Render();
    }

}

class LayerGenerator extends UIElement {
    private fullConfig: UIEventSource<LayoutConfigJson>;
    private layerConfig: UIEventSource<LayerConfigJson>;
    private generateField: ((label: string, key: string, root: any, deflt?: string) => UIElement);
    private uielements: UIElement[];

    constructor(fullConfig: UIEventSource<LayoutConfigJson>,
                layerConfig: LayerConfigJson) {
        super(undefined);
        this.layerConfig = new UIEventSource<LayerConfigJson>(layerConfig);
        this.fullConfig = fullConfig;
        this.CreateElements(fullConfig, layerConfig)

    }

    private CreateElements(fullConfig: UIEventSource<LayoutConfigJson>, layerConfig: LayerConfigJson) {
        const self = this;
        this.uielements = [

            new FixedUiElement("<p>A layer is a collection of related objects which have the same or very similar tags renderings. In general, all objects of one layer have the same icon (or at least very similar icons)</p>"),

            createFieldUI("Name", "id", layerConfig, {description: "The name of this layer"}),
            createFieldUI("A description of objects for this layer", "description", layerConfig, {description: "The description of this layer"}),
            createFieldUI("Minimum zoom level", "minzoom", layerConfig, {
                type: "nat",
                deflt: "12",
                description: "The minimum zoom level to start loading data. This is mainly limited by the expected number of objects: if there are a lot of objects, then pick something higher. A generous bounding box is put around the map, so some scrolling should be possible"
            }),
            createFieldUI("The tags to load from overpass", "overpassTags", layerConfig, {
                type: "tags",
                description: "Tags to load from overpass. The format is <span class='literal-code'>key=value&key0=value0&key1=value1</span>, e.g. <span class='literal-code'>amenity=public_bookcase</span> or <span class='literal-code'>amenity=compressed_air&bicycle=yes</span>. Note that a wildcard is supported, e.g. <span class='literal-code'>key=*</span> to have everything. An missing tag can be expressed as <span class='literal-code'>key=</span>, not as <span class='literal-code'>key!=value</span>. E.g. something that is indoor and not private and has no name tag can be queried as <span class='literal-code'>indoor=yes&name=&access!=private</span>"
            }),

            createFieldUI("Wayhandling","wayHandling", layerConfig, {
                type:"wayhandling",
                description: "Specifies how ways (lines and areas) are handled: either the way is shown, a center point is shown or both"
            }),

            new TagRenderingGenerator(fullConfig, layerConfig, layerConfig.title ?? {
                key: "",
                addExtraTags: "",
                mappings: [],
                question: "",
                render: "Title",
                type: "string"
            }, {
                header: "Title element",
                description: "This element is shown in the title of the popup in a header-tag",
                removable: false,
                hideQuestion: true
            }),


            new TagRenderingGenerator(fullConfig, layerConfig, layerConfig.icon ?? {
                key: "*",
                addExtraTags: "",
                mappings: [],
                question: "",
                render: "./assets/bug.svg",
                type: "text"
            }, {
                header: "Icon",
                description: "This decides which icon is used to represent an element on the map. Leave blank if you don't want icons to pop up",
                removable: false,
                hideQuestion: true
            }),
            

            new TagRenderingGenerator(fullConfig, layerConfig, layerConfig.color ?? {
                key: "*",
                addExtraTags: "",
                mappings: [],
                question: "",
                render: "#0000ff",
                type: "text"
            }, {
                header: "Colour",
                description: "This decides which color is used to represent a way on the map. Note that if an icon is defined as well, the icon will be showed too",
                removable: false,
                hideQuestion: true
            }),

            new TagRenderingGenerator(fullConfig, layerConfig, layerConfig.width ?? {
                key: "*",
                addExtraTags: "",
                mappings: [],
                question: "",
                render: "10",
                type: "nat"
            }, {
                header: "Line thickness",
                description: "This decides the line thickness of ways (in pixels)",
                removable: false,
                hideQuestion: true
            }),


            ...layerConfig.tagRenderings.map(tr => new TagRenderingGenerator(fullConfig, layerConfig, tr, {
                header: "Tag rendering",
                description: "A single tag rendering",
                removable: true,
                hideQuestion: false
            })),
            new Button("Add a tag rendering", () => {
                layerConfig.tagRenderings.push({
                    key: undefined,
                    addExtraTags: undefined,
                    mappings: [],
                    question: undefined,
                    render: undefined,
                    type: "text"
                });
                self.CreateElements(fullConfig, layerConfig);
                self.Update();
            }),


            ...layerConfig.presets.map(preset => new PresetGenerator(fullConfig, layerConfig, preset)),
            new Button("Add a preset", () => {
                layerConfig.presets.push({
                    icon: undefined,
                    title: "",
                    description: "",
                    tags: TagsToString(layerConfig.overpassTags)
                });
                self.CreateElements(fullConfig, layerConfig);
                self.Update();
            })

        ]
    }

    InnerRender(): string {
        return new VerticalCombine(this.uielements).Render();
    }
}


class AllLayerComponent extends UIElement {

    private tabs: TabbedComponent;
    private config: UIEventSource<LayoutConfigJson>;

    constructor(config: UIEventSource<LayoutConfigJson>) {
        super(undefined);
        this.config = config;
        const self = this;
        let previousLayerAmount = config.data.layers.length;
        config.addCallback((data) => {
            if (data.layers.length != previousLayerAmount) {
                previousLayerAmount = data.layers.length;
                self.UpdateTabs();
                self.Update();
            }
        });
        this.UpdateTabs();

    }

    private UpdateTabs() {
        const layerPanes: { header: UIElement | string, content: UIElement | string }[] = [];
        const config = this.config;
        for (const layer of this.config.data.layers) {

            const iconUrl = CustomLayoutFromJSON.TagRenderingFromJson(layer?.icon)
                .GetContent({id: "node/-1"});
            const header = this.config.map(() => {

                return `<img src="${iconUrl ?? "./assets/help.svg"}">`
            });
            layerPanes.push({
                header: new VariableUiElement(header),
                content: new LayerGenerator(config, layer)
            })
        }


        layerPanes.push({
            header: "<img src='./assets/add.svg'>",
            content: new Button("Add a new layer", () => {
                config.data.layers.push({
                    id: "",
                    title: {
                        key: "*",
                        render: "Title"
                    },
                    icon: {
                        key: "*",
                        render: "./assets/bug.svg"
                    },
                    color: {
                        key: "*",
                        render: "#0000ff"
                    },
                    width: {
                        key:"*",
                        render: "10"
                    },
                    description: "",
                    minzoom: 12,
                    overpassTags: "",
                    wayHandling: LayerDefinition.WAYHANDLING_CENTER_AND_WAY,
                    presets: [{}],
                    tagRenderings: []
                });

                config.ping();
            })
        })

        this.tabs = new TabbedComponent(layerPanes);
    }

    InnerRender(): string {
        return this.tabs.Render();
    }

}


export class ThemeGenerator extends UIElement {

    private readonly userDetails: UIEventSource<UserDetails>;

    public readonly themeObject: UIEventSource<LayoutConfigJson>;
    private readonly allQuestionFields: UIElement[];
    public url: UIEventSource<string>;

    private loginButton: Button

    constructor(connection: OsmConnection, windowHash) {
        super(connection.userDetails);
        this.userDetails = connection.userDetails;
        this.loginButton = new Button("Log in with OSM", () => {
            connection.AttemptLogin()
        })

        const defaultTheme = {layers: [], icon: "./assets/bug.svg"};
        let loadedTheme = undefined;
        if (windowHash !== undefined && windowHash.length > 4) {
            loadedTheme = JSON.parse(atob(windowHash));
        }

        this.themeObject = new UIEventSource<LayoutConfigJson>(loadedTheme ?? defaultTheme);
        const jsonObjectRoot = this.themeObject.data;
        connection.userDetails.addCallback((userDetails) => {
            jsonObjectRoot.maintainer = userDetails.name;
        });
        jsonObjectRoot.maintainer = connection.userDetails.data.name;


        const base64 = this.themeObject.map(JSON.stringify).map(btoa);
        let baseUrl = "https://pietervdvn.github.io/MapComplete";
        if (window.location.hostname === "127.0.0.1") {
            baseUrl = "http://127.0.0.1:1234";
        }
        this.url = base64.map((data) => baseUrl + `/index.html?test=true&userlayout=true#` + data);
        const self = this;

        createFieldUI = (label, key, root, options) => {

            options = options ?? {description: "?"};
            options.type = options.type ?? "string";

            const value = new UIEventSource<string>(TagsToString(root[key]) ?? options?.deflt);
            let textField: UIElement;
            if (options.type === "typeSelector") {
                const options: { value: string, shown: string | UIElement }[] = [];
                for (const possibleType in ValidatedTextField.inputValidation) {
                    if (possibleType !== "$") {
                        options.push({value: possibleType, shown: possibleType});
                    }
                }

                textField = new DropDown<string>("",
                    options,
                    value)
            } else if (options.type === "wayhandling") {
                const options: { value: string, shown: string | UIElement }[] =
                    [{value: "" + LayerDefinition.WAYHANDLING_DEFAULT, shown: "Show a line/area as line/area"},
                        {
                            value: "" + LayerDefinition.WAYHANDLING_CENTER_AND_WAY,
                            shown: "Show a line/area as line/area AND show an icon at the center"
                        },
                        {
                            value: "" + LayerDefinition.WAYHANDLING_CENTER_ONLY,
                            shown: "Only show the centerpoint of a way"
                        }];

                textField = new DropDown<string>("",
                    options,
                    value)

            } else if (options.type === "tags") {
                textField = ValidatedTextField.TagTextField(value.map(CustomLayoutFromJSON.TagsFromJson, [], tags => {
                    if (tags === undefined) {
                        return undefined;
                    }
                    return tags.map((tag: Tag) => tag.key + "=" + tag.value).join("&");
                }), options?.emptyAllowed ?? false);
            } else if (options.type === "img" || options.type === "colour") {
                textField = new TextField<string>({
                    placeholder: options.type,
                    fromString: (str) => str,
                    toString: (str) => str,
                    value: value,
                    startValidated: true
                });
            } else if (options.type) {
                textField = ValidatedTextField.ValidatedTextField(options.type, {value: value});
            } else {
                textField = new TextField<string>({
                    placeholder: options.type,
                    fromString: (str) => str,
                    toString: (str) => str,
                    value: value,
                    startValidated: true
                });
            }

            value.addCallback((v) => {
                if (v === undefined || v === "") {
                    delete root[key];
                } else {
                    root[key] = v;
                }
                self.themeObject.ping(); // We assume the root is a part of the themeObject
            });
            return new Combine([
                label,
                textField,
                "<br>",
                "<span class='subtle'>" + options.description + "</span>"
            ]);
        }

        this.allQuestionFields = [
            createFieldUI("Name of this theme", "name", jsonObjectRoot, {description: "An identifier for this theme"}),
            createFieldUI("Title", "title", jsonObjectRoot, {
                deflt: "Title",
                description: "The title of this theme, as shown in the welcome message and in the title bar of the browser"
            }),
            createFieldUI("Description", "description", jsonObjectRoot, {
                description: "Shown in the welcome message",
                deflt: "Description"
            }),
            createFieldUI("The supported language", "language", jsonObjectRoot, {
                description: "The language of this mapcomplete instance. MapComplete can be translated, see <a href='https://github.com/pietervdvn/MapComplete#translating-mapcomplete' target='_blank'> here for more information</a>",
                deflt: "en"
            }),
            createFieldUI("startLat", "startLat", jsonObjectRoot, {
                type: "float",
                deflt: "0",
                description: "The latitude where this theme should start. Note that this is only for completely fresh users, as the last location is saved"
            }),
            createFieldUI("startLon", "startLon", jsonObjectRoot, {
                type: "float",
                deflt: "0",
                description: "The longitude where this theme should start. Note that this is only for completely fresh users, as the last location is saved"
            }),
            createFieldUI("startzoom", "startZoom", jsonObjectRoot, {
                type: "nat",
                deflt: "12",
                description: "The initial zoom level where the map is located"
            }),
            createFieldUI("icon", "icon", jsonObjectRoot, {
                deflt: "./assets/bug.svg",
                type: "img",
                description: "The icon representing this MapComplete instance. It is shown in the welcome message and -if adopted as official theme- used as favicon and to browse themes"
            }),

            new AllLayerComponent(this.themeObject)
        ]


    }

    InnerRender(): string {

        if (!this.userDetails.data.loggedIn) {
            return new Combine(["Not logged in. You need to be logged in to create a theme.", this.loginButton]).Render();
        }
        if (this.userDetails.data.csCount < State.userJourney.themeGeneratorUnlock        ) {
            return `You need at least ${State.userJourney.themeGeneratorUnlock} changesets to create your own theme.`;
        }


        return new VerticalCombine([
            ...this.allQuestionFields,
        ]).Render();
    }
}