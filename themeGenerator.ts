import {UIElement} from "./UI/UIElement";
import {OsmConnection, UserDetails} from "./Logic/Osm/OsmConnection";
import {UIEventSource} from "./UI/UIEventSource";
import Combine from "./UI/Base/Combine";
import {TextField} from "./UI/Input/TextField";
import {VariableUiElement} from "./UI/Base/VariableUIElement";
import {VerticalCombine} from "./UI/Base/VerticalCombine";
import {FixedUiElement} from "./UI/Base/FixedUiElement";
import {TabbedComponent} from "./UI/Base/TabbedComponent";
import {LayerConfigJson, LayoutConfigJson, TagRenderingConfigJson} from "./Customizations/JSON/CustomLayoutFromJSON";
import {Button} from "./UI/Base/Button";
import {type} from "os";
import {Tag} from "./Logic/TagsFilter";

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

export class Preview extends UIElement {
    private url: UIEventSource<string>;
    private config: UIEventSource<LayoutConfigJson>;

    constructor(url: UIEventSource<string>, config: UIEventSource<LayoutConfigJson>) {
        super(url);
        this.config = config;
        this.url = url;
    }

    InnerRender(): string {
        const url = this.url.data;
        return JSON.stringify(this.config.data, null, 2)
    }

}

class MappingGenerator extends UIElement {

    private elements: UIElement[];

    constructor(fullConfig: UIEventSource<LayoutConfigJson>,
                layerConfig: LayerConfigJson,
                tagRendering: TagRenderingConfigJson,
                mapping: { if: string | string[] | { k: string, v: string }[] },
                generateField: (src: UIEventSource<any>, label: string, key: string, root: any, deflt?: string) => UIElement) {
        super(undefined);
        this.CreateElements(fullConfig, layerConfig, tagRendering, mapping, generateField)
    }

    private CreateElements(fullConfig: UIEventSource<LayoutConfigJson>, layerConfig: LayerConfigJson,
                           tagRendering: TagRenderingConfigJson,
                           mapping,
                           generateField: (src: UIEventSource<any>, label: string, key: string, root: any, deflt?: string) => UIElement) {
        {
            const self = this;
            this.elements = [
                generateField(fullConfig, "If these tags apply", "if", mapping),
                generateField(fullConfig, "Then: show this text", "then", mapping),
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
                generateField: (src: UIEventSource<any>, label: string, key: string, root: any, deflt?: string) => UIElement,
                isTitle: boolean = false) {
        super(undefined);
        this.CreateElements(fullConfig, layerConfig, tagRendering, generateField, isTitle)
    }

    private CreateElements(fullConfig: UIEventSource<LayoutConfigJson>, layerConfig: LayerConfigJson, tagRendering: TagRenderingConfigJson, generateField: (src: UIEventSource<any>, label: string, key: string, root: any, deflt?: string) => UIElement, isTitle: boolean) {


        const self = this;
        this.elements = [
            new FixedUiElement(isTitle ? "<h3>Popup title</h3>" : "<h3>TagRendering/TagQuestion</h3>"),
            generateField(fullConfig, "Key", "key", tagRendering),
            generateField(fullConfig, "Rendering", "render", tagRendering),
            generateField(fullConfig, "Type", "type", tagRendering),
            generateField(fullConfig, "Question", "question", tagRendering),
            generateField(fullConfig, "Extra tags", "addExtraTags", tagRendering),

            ...(tagRendering.mappings ?? []).map((mapping) => {
                return new MappingGenerator(fullConfig, layerConfig, tagRendering, mapping,
                    generateField)
            }),
            new Button("Add mapping", () => {
                if(tagRendering.mappings === undefined){
                    tagRendering.mappings = []
                }
                tagRendering.mappings.push({if: "", then: ""});
                self.CreateElements(fullConfig, layerConfig, tagRendering, generateField, isTitle);
                self.Update();
            })

        ]

        if (!isTitle) {
            const b = new Button("Remove this preset", () => {
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
                preset0: { title?: string, description?: string, icon?: string, tags?: string | string[] | { k: string, v: string }[] },
                generateField: (src: UIEventSource<any>, label: string, key: string, root: any, deflt?: string) => UIElement) {
        super(undefined);
        const self = this;
        this.elements = [
            new FixedUiElement("<h3>Preset</h3>"),
            generateField(fullConfig, "Title", "title", preset0),
            generateField(fullConfig, "Description", "description", preset0, layerConfig.description),
            generateField(fullConfig, "icon", "icon", preset0, layerConfig.icon),
            generateField(fullConfig, "tags", "tags", preset0, TagsToString(layerConfig.overpassTags)),
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
                layerConfig: LayerConfigJson,
                generateField: ((src: UIEventSource<any>, label: string, key: string, root: any, deflt?: string) => UIElement)) {
        super(undefined);
        this.layerConfig = new UIEventSource<LayerConfigJson>(layerConfig);
        this.fullConfig = fullConfig;
        this.CreateElements(fullConfig, layerConfig, generateField)

    }

    private CreateElements(fullConfig: UIEventSource<LayoutConfigJson>, layerConfig: LayerConfigJson, generateField: (src: UIEventSource<any>, label: string, key: string, root: any, deflt?: string) => UIElement) {
        const self = this;
        this.uielements = [
            generateField(fullConfig, "The name of this layer", "id", layerConfig),
            generateField(fullConfig, "A description of objects for this layer", "description", layerConfig),
            generateField(fullConfig, "The icon of this layer, either a URL or a base64-encoded svg", "icon", layerConfig),
            generateField(fullConfig, "The default stroke color", "color", layerConfig),
            generateField(fullConfig, "The minimal needed zoom to start loading", "minzoom", layerConfig),
            generateField(fullConfig, "The tags to load from overpass", "overpassTags", layerConfig),
            ...layerConfig.presets.map(preset => new PresetGenerator(fullConfig, layerConfig, preset, generateField)),
            new Button("Add a preset", () => {
                layerConfig.presets.push({
                    icon: undefined,
                    title: "",
                    description: "",
                    tags: TagsToString(layerConfig.overpassTags)
                });
                self.CreateElements(fullConfig, layerConfig, generateField);
                self.Update();
            }),
            new TagRenderingGenerator(fullConfig, layerConfig, layerConfig.title ?? {
                key: "",
                addExtraTags: "",
                mappings: [],
                question: "",
                render: "Title",
                type: "text"
            }, generateField, true),
            ...layerConfig.tagRenderings.map(tr => new TagRenderingGenerator(fullConfig, layerConfig, tr, generateField)),
            new Button("Add a tag rendering", () => {
                layerConfig.tagRenderings.push({
                    key: "",
                    addExtraTags: "",
                    mappings: [],
                    question: "",
                    render: "",
                    type: "text"
                });
                self.CreateElements(fullConfig, layerConfig, generateField);
                self.Update();
            }),

        ]
    }

    InnerRender(): string {
        return new VerticalCombine(this.uielements).Render();
    }
}


class AllLayerComponent extends UIElement {

    private tabs: TabbedComponent;
    private config: UIEventSource<LayoutConfigJson>;
    private generateField: ((src: UIEventSource<any>, label: string, key: string, root: any, deflt?: string) => UIElement);

    constructor(config: UIEventSource<LayoutConfigJson>, generateField: ((src: UIEventSource<any>, label: string, key: string, root: any, deflt?: string) => UIElement)) {
        super(undefined);
        this.generateField = generateField;
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
            const header = this.config.map(() => {
                return `<img src="${layer?.icon ?? "./assets/help.svg"}">`
            });
            layerPanes.push({
                header: new VariableUiElement(header),
                content: new LayerGenerator(config, layer, this.generateField)
            })
        }


        layerPanes.push({
            header: "<img src='./assets/add.svg'>",
            content: new Button("Add a new layer", () => {
                config.data.layers.push({
                    id: "",
                    title: {
                        render: "Title"
                    },
                    icon: "./assets/bug.svg",
                    color: "",
                    description: "",
                    minzoom: 12,
                    overpassTags: "",
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


    constructor(connection: OsmConnection, windowHash) {
        super(connection.userDetails);
        this.userDetails = connection.userDetails;

        const defaultTheme = {layers: [], icon: "./assets/bug.svg"};
        let loadedTheme = undefined;
        if (windowHash !== undefined && windowHash.length > 4) {
            loadedTheme = JSON.parse(atob(windowHash));
        }
        this.themeObject = new UIEventSource<LayoutConfigJson>(loadedTheme ?? defaultTheme);
        const jsonObjectRoot = this.themeObject.data;

        const base64 = this.themeObject.map(JSON.stringify).map(btoa);
        this.url = base64.map((data) => `${window.location.origin}/index.html?userlayout=true#` + data);
        const self = this;
        this.allQuestionFields = [
            this.JsonField(this.themeObject, "Name of this theme", "name", jsonObjectRoot),
            this.JsonField(this.themeObject, "Title (shown in the window and in the welcome message)", "title", jsonObjectRoot),
            this.JsonField(this.themeObject, "Description (shown in the welcome message and various other places)", "description", jsonObjectRoot),
            this.JsonField(this.themeObject, "The supported language", "language", jsonObjectRoot),
            this.JsonField(this.themeObject, "startLat", "startLat", jsonObjectRoot),
            this.JsonField(this.themeObject, "startLon", "startLon", jsonObjectRoot),
            this.JsonField(this.themeObject, "startzoom", "startZoom", jsonObjectRoot),
            this.JsonField(this.themeObject, "icon: either a URL to an image file, a relative url to a MapComplete asset ('./asset/help.svg') or a base64-encoded value (including 'data:image/svg+xml;base64,'", "icon", jsonObjectRoot, "./assets/bug.svg"),

            new AllLayerComponent(this.themeObject, self.JsonField)
        ]


    }


    private JsonField(themeObject: UIEventSource<LayoutConfigJson>, label: string, key: string, root: any, deflt: string = "") {
        const value = new UIEventSource<string>(TagsToString(root[key]) ?? deflt);
        value.addCallback((v) => {
            root[key] = v;
            themeObject.ping(); // We assume the root is a part of the themeObject
        })
        return new Combine([
            label,
            new TextField<string>({
                fromString: (str) => str,
                toString: (str) => str,
                value: value
            })]);
    }

    InnerRender(): string {

        if (!this.userDetails.data.loggedIn) {
            return "Not logged in"
        }
        if (this.userDetails.data.csCount < 500) {
            return "You need at least 500 changesets to create your own theme";
        }


        return new VerticalCombine([
            // new VariableUiElement(this.themeObject.map(JSON.stringify)),
            new VariableUiElement(this.url.map((url) => `Current URL: <a href="${url}" target="_blank">Click here to open</a>`)),
            ...this.allQuestionFields,
        ]).Render();
    }
}