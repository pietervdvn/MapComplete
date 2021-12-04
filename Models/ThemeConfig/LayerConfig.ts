import {Translation} from "../../UI/i18n/Translation";
import SourceConfig from "./SourceConfig";
import TagRenderingConfig from "./TagRenderingConfig";
import PresetConfig, {PreciseInput} from "./PresetConfig";
import {LayerConfigJson} from "./Json/LayerConfigJson";
import Translations from "../../UI/i18n/Translations";
import {TagUtils} from "../../Logic/Tags/TagUtils";
import FilterConfig from "./FilterConfig";
import {Unit} from "../Unit";
import DeleteConfig from "./DeleteConfig";
import MoveConfig from "./MoveConfig";
import PointRenderingConfig from "./PointRenderingConfig";
import WithContextLoader from "./WithContextLoader";
import LineRenderingConfig from "./LineRenderingConfig";
import PointRenderingConfigJson from "./Json/PointRenderingConfigJson";
import LineRenderingConfigJson from "./Json/LineRenderingConfigJson";
import {TagRenderingConfigJson} from "./Json/TagRenderingConfigJson";
import {UIEventSource} from "../../Logic/UIEventSource";
import BaseUIElement from "../../UI/BaseUIElement";
import Combine from "../../UI/Base/Combine";
import Title from "../../UI/Base/Title";
import List from "../../UI/Base/List";
import Link from "../../UI/Base/Link";
import {Utils} from "../../Utils";
import * as icons from "../../assets/tagRenderings/icons.json"

export default class LayerConfig extends WithContextLoader {

    public readonly id: string;
    public readonly name: Translation;
    public readonly description: Translation;
    public readonly source: SourceConfig;
    public readonly calculatedTags: [string, string][];
    public readonly doNotDownload: boolean;
    public readonly  passAllFeatures: boolean;
    public readonly isShown: TagRenderingConfig;
    public readonly  minzoom: number;
    public readonly  minzoomVisible: number;
    public readonly  maxzoom: number;
    public readonly title?: TagRenderingConfig;
    public readonly titleIcons: TagRenderingConfig[];

    public readonly mapRendering: PointRenderingConfig[]
    public readonly lineRendering: LineRenderingConfig[]

    public readonly units: Unit[];
    public readonly deletion: DeleteConfig | null;
    public readonly allowMove: MoveConfig | null
    public readonly allowSplit: boolean
    /**
     * In seconds
     */
    public readonly maxAgeOfCache: number

    public readonly presets: PresetConfig[];

    public readonly tagRenderings: TagRenderingConfig[];
    public readonly filters: FilterConfig[];

    constructor(
        json: LayerConfigJson,
        context?: string,
        official: boolean = true
    ) {
        context = context + "." + json.id;
        super(json, context)
        this.id = json.id;

        if (json.source === undefined) {
            throw "Layer " + this.id + " does not define a source section (" + context + ")"
        }

        if (json.source.osmTags === undefined) {
            throw "Layer " + this.id + " does not define a osmTags in the source section - these should always be present, even for geojson layers (" + context + ")"

        }

        this.maxAgeOfCache = json.source.maxCacheAge ?? 24 * 60 * 60 * 30

        const osmTags = TagUtils.Tag(
            json.source.osmTags,
            context + "source.osmTags"
        );

        if (json.source["geoJsonSource"] !== undefined) {
            throw context + "Use 'geoJson' instead of 'geoJsonSource'";
        }

        if (json.source["geojson"] !== undefined) {
            throw context + "Use 'geoJson' instead of 'geojson' (the J is a capital letter)";
        }

        this.source = new SourceConfig(
            {
                osmTags: osmTags,
                geojsonSource: json.source["geoJson"],
                geojsonSourceLevel: json.source["geoJsonZoomLevel"],
                overpassScript: json.source["overpassScript"],
                isOsmCache: json.source["isOsmCache"],
                mercatorCrs: json.source["mercatorCrs"]
            },
            json.id
        );


        this.allowSplit = json.allowSplit ?? false;
        this.name = Translations.T(json.name, context + ".name");
        this.units = (json.units ?? []).map(((unitJson, i) => Unit.fromJson(unitJson, `${context}.unit[${i}]`)))

        if (json.description !== undefined) {
            if (Object.keys(json.description).length === 0) {
                json.description = undefined;
            }
        }

        this.description = Translations.T(
            json.description,
            context + ".description"
        );


        this.calculatedTags = undefined;
        if (json.calculatedTags !== undefined) {
            if (!official) {
                console.warn(
                    `Unofficial theme ${this.id} with custom javascript! This is a security risk`
                );
            }
            this.calculatedTags = [];
            for (const kv of json.calculatedTags) {
                const index = kv.indexOf("=");
                const key = kv.substring(0, index);
                const code = kv.substring(index + 1);

                try {
                    new Function("feat", "return " + code + ";");
                } catch (e) {
                    throw `Invalid function definition: code ${code} is invalid:${e} (at ${context})`
                }


                this.calculatedTags.push([key, code]);
            }
        }

        this.doNotDownload = json.doNotDownload ?? false;
        this.passAllFeatures = json.passAllFeatures ?? false;
        this.minzoom = json.minzoom ?? 0;
        this.minzoomVisible = json.minzoomVisible ?? this.minzoom;
        if (json.presets !== undefined && json.presets?.map === undefined) {
            throw "Presets should be a list of items (at " + context + ")"
        }
        this.presets = (json.presets ?? []).map((pr, i) => {
            let preciseInput: PreciseInput = {
                preferredBackground: ["photo"],
                snapToLayers: undefined,
                maxSnapDistance: undefined
            };
            if (pr.preciseInput !== undefined) {
                if (pr.preciseInput === true) {
                    pr.preciseInput = {
                        preferredBackground: undefined
                    }
                }
                
                let snapToLayers: string[];
                if (typeof pr.preciseInput.snapToLayer === "string") {
                    snapToLayers = [pr.preciseInput.snapToLayer]
                } else {
                    snapToLayers = pr.preciseInput.snapToLayer
                }

                let preferredBackground: string[]
                if (typeof pr.preciseInput.preferredBackground === "string") {
                    preferredBackground = [pr.preciseInput.preferredBackground]
                } else {
                    preferredBackground = pr.preciseInput.preferredBackground
                }
                preciseInput = {
                    preferredBackground: preferredBackground,
                    snapToLayers,
                    maxSnapDistance: pr.preciseInput.maxSnapDistance ?? 10
                }
            }

            const config: PresetConfig = {
                title: Translations.T(pr.title, `${context}.presets[${i}].title`),
                tags: pr.tags.map((t) => TagUtils.SimpleTag(t)),
                description: Translations.T(pr.description, `${context}.presets[${i}].description`),
                preciseInput: preciseInput,
            }
            return config;
        });

        if (json.mapRendering === undefined) {
            throw "MapRendering is undefined in " + context
        }

        if (json.mapRendering === null) {
            this.mapRendering = []
            this.lineRendering = []
        } else {
            this.mapRendering = Utils.NoNull(json.mapRendering)
                .filter(r => r["location"] !== undefined)
                .map((r, i) => new PointRenderingConfig(<PointRenderingConfigJson>r, context + ".mapRendering[" + i + "]"))

            this.lineRendering = Utils.NoNull(json.mapRendering)
                .filter(r => r["location"] === undefined)
                .map((r, i) => new LineRenderingConfig(<LineRenderingConfigJson>r, context + ".mapRendering[" + i + "]"))

            const hasCenterRendering = this.mapRendering.some(r => r.location.has("centroid") || r.location.has("start") || r.location.has("end"))

            if (this.lineRendering.length === 0 && this.mapRendering.length === 0) {
                console.log(json.mapRendering)
                throw("The layer " + this.id + " does not have any maprenderings defined and will thus not show up on the map at all. If this is intentional, set maprenderings to 'null' instead of '[]'")
            } else if (!hasCenterRendering && this.lineRendering.length === 0) {
                throw "The layer " + this.id + " might not render ways. This might result in dropped information"
            }
        }

        const missingIds = json.tagRenderings?.filter(tr => typeof tr !== "string" && tr["builtin"] === undefined && tr["id"] === undefined && tr["rewrite"] === undefined) ?? [];
        if (missingIds?.length > 0 && official) {
            console.error("Some tagRenderings of", this.id, "are missing an id:", missingIds)
            throw "Missing ids in tagrenderings"
        }

        this.tagRenderings = this.ExtractLayerTagRenderings(json, official)
        if (official) {

            const emptyIds = this.tagRenderings.filter(tr => tr.id === "");
            if (emptyIds.length > 0) {
                throw `Some tagrendering-ids are empty or have an emtpy string; this is not allowed (at ${context})`
            }

            const duplicateIds = Utils.Dupicates(this.tagRenderings.map(f => f.id).filter(id => id !== "questions"))
            if (duplicateIds.length > 0) {
                throw `Some tagRenderings have a duplicate id: ${duplicateIds} (at ${context}.tagRenderings)`
            }
        }

        this.filters = (json.filter ?? []).map((option, i) => {
            return new FilterConfig(option, `${context}.filter-[${i}]`)
        });

        {
            const duplicateIds = Utils.Dupicates(this.filters.map(f => f.id))
            if (duplicateIds.length > 0) {
                throw `Some filters have a duplicate id: ${duplicateIds} (at ${context}.filters)`
            }
        }

        if (json["filters"] !== undefined) {
            throw "Error in " + context + ": use 'filter' instead of 'filters'"
        }

        const titleIcons = [];
        const defaultIcons = icons.defaultIcons;
        for (const icon of json.titleIcons ?? defaultIcons) {
            if (icon === "defaults") {
                titleIcons.push(...defaultIcons);
            } else {
                titleIcons.push(icon);
            }
        }

        this.titleIcons = this.ParseTagRenderings(titleIcons, {
            readOnlyMode: true
        });

        this.title = this.tr("title", undefined);
        this.isShown = this.tr("isShown", "yes");

        this.deletion = null;
        if (json.deletion === true) {
            json.deletion = {};
        }
        if (json.deletion !== undefined && json.deletion !== false) {
            this.deletion = new DeleteConfig(json.deletion, `${context}.deletion`);
        }

        this.allowMove = null
        if (json.allowMove === false) {
            this.allowMove = null;
        } else if (json.allowMove === true) {
            this.allowMove = new MoveConfig({}, context + ".allowMove")
        } else if (json.allowMove !== undefined && json.allowMove !== false) {
            this.allowMove = new MoveConfig(json.allowMove, context + ".allowMove")
        }


        if (json["showIf"] !== undefined) {
            throw (
                "Invalid key on layerconfig " +
                this.id +
                ": showIf. Did you mean 'isShown' instead?"
            );
        }
    }

    public defaultIcon(): BaseUIElement | undefined {
        if (this.mapRendering === undefined || this.mapRendering === null) {
            return undefined;
        }
        const mapRendering = this.mapRendering.filter(r => r.location.has("point"))[0]
        if (mapRendering === undefined) {
            return undefined
        }
        const defaultTags = new UIEventSource(TagUtils.changeAsProperties(this.source.osmTags.asChange({id: "node/-1"})))
        return mapRendering.GenerateLeafletStyle(defaultTags, false, {noSize: true}).html
    }

    public ExtractLayerTagRenderings(json: LayerConfigJson, official: boolean): TagRenderingConfig[] {

        if (json.tagRenderings === undefined) {
            return []
        }

        const normalTagRenderings: (string | { builtin: string, override: any } | TagRenderingConfigJson)[] = []


        const renderingsToRewrite: ({
            rewrite: {
                sourceString: string,
                into: string[]
            }, renderings: (string | { builtin: string, override: any } | TagRenderingConfigJson)[]
        })[] = []
        for (let i = 0; i < json.tagRenderings.length; i++) {
            const tr = json.tagRenderings[i];
            const rewriteDefined = tr["rewrite"] !== undefined
            const renderingsDefined = tr["renderings"]

            if (!rewriteDefined && !renderingsDefined) {
                // @ts-ignore
                normalTagRenderings.push(tr)
                continue
            }
            if (rewriteDefined && renderingsDefined) {
                // @ts-ignore
                renderingsToRewrite.push(tr)
                continue
            }
            throw `Error in ${this._context}.tagrenderings[${i}]: got a value which defines either \`rewrite\` or \`renderings\`, but not both. Either define both or move the \`renderings\`  out of this scope`
        }

        const allRenderings = this.ParseTagRenderings(normalTagRenderings,
            {
                requiresId: official
            });

        if (renderingsToRewrite.length === 0) {
            return allRenderings
        }

        /* Used for left|right group creation and replacement */
        function prepConfig(keyToRewrite: string, target: string, tr: TagRenderingConfigJson) {

            function replaceRecursive(transl: string | any) {
                if (typeof transl === "string") {
                    return transl.replace(keyToRewrite, target)
                }
                if (transl.map !== undefined) {
                    return transl.map(o => replaceRecursive(o))
                }
                transl = {...transl}
                for (const key in transl) {
                    transl[key] = replaceRecursive(transl[key])
                }
                return transl
            }

            const orig = tr;
            tr = replaceRecursive(tr)

            tr.id = target + "-" + orig.id
            tr.group = target
            return tr
        }

        const rewriteGroups: Map<string, TagRenderingConfig[]> = new Map<string, TagRenderingConfig[]>()
        for (const rewriteGroup of renderingsToRewrite) {

            const tagRenderings = rewriteGroup.renderings
            const textToReplace = rewriteGroup.rewrite.sourceString
            const targets = rewriteGroup.rewrite.into
            for (const target of targets) {
                const parsedRenderings = this.ParseTagRenderings(tagRenderings,  {
                    prepConfig: tr => prepConfig(textToReplace, target, tr)
                })

                if (!rewriteGroups.has(target)) {
                    rewriteGroups.set(target, [])
                }
                rewriteGroups.get(target).push(...parsedRenderings)
            }
        }


        rewriteGroups.forEach((group, groupName) => {
            group.push(new TagRenderingConfig({
                id: "questions",
                group: groupName
            }))
        })

        rewriteGroups.forEach(group => {
            allRenderings.push(...group)
        })


        return allRenderings;

    }

    public GenerateDocumentation(usedInThemes: string[], addedByDefault = false, canBeIncluded = true): BaseUIElement {
        const extraProps = []

        if (canBeIncluded) {
            if (addedByDefault) {
                extraProps.push("**This layer is included automatically in every theme. This layer might contain no points**")
            }
            if (this.title === undefined) {
                extraProps.push("Not clickable by default. If you import this layer in your theme, override `title` to make this clickable")
            }
            if (this.name === undefined) {
                extraProps.push("Not visible in the layer selection by default. If you want to make this layer toggable, override `name`")
            }
            if (this.mapRendering.length === 0) {
                extraProps.push("Not rendered on the map by default. If you want to rendering this on the map, override `mapRenderings`")
            }
        } else {
            extraProps.push("This layer can **not** be included in a theme. It is solely used by [special renderings](SpecialRenderings.md) showing a minimap with custom data.")
        }


        let usingLayer: BaseUIElement[] = []
        if (usedInThemes?.length > 0 && !addedByDefault) {
            usingLayer = [new Title("Themes using this layer", 4),
                new List((usedInThemes ?? []).map(id => new Link(id, "https://mapcomplete.osm.be/" + id)))
            ]
        }

        for (const dep of Array.from(this.getDependencies())) {
            extraProps.push(new Combine(["This layer will automatically load ", new Link(dep, "#"+dep)," into the layout as it depends on it."]))
        }

        return new Combine([
            new Title(this.id, 3),
            this.description,

            new Link("Go to the source code", `../assets/layers/${this.id}/${this.id}.json`),

            new List(extraProps),
            ...usingLayer
        ]).SetClass("flex flex-col")
    }

    public CustomCodeSnippets(): string[] {
        if (this.calculatedTags === undefined) {
            return [];
        }
        return this.calculatedTags.map((code) => code[1]);
    }

    public ExtractImages(): Set<string> {
        const parts: Set<string>[] = [];
        parts.push(...this.tagRenderings?.map((tr) => tr.ExtractImages(false)));
        parts.push(...this.titleIcons?.map((tr) => tr.ExtractImages(true)));
        for (const preset of this.presets) {
            parts.push(new Set<string>(preset.description?.ExtractImages(false)));
        }
        for (const pointRenderingConfig of this.mapRendering) {
            parts.push(pointRenderingConfig.ExtractImages())
        }
        const allIcons = new Set<string>();
        for (const part of parts) {
            part?.forEach(allIcons.add, allIcons);
        }

        return allIcons;
    }

    public isLeftRightSensitive(): boolean {
        return this.lineRendering.some(lr => lr.leftRightSensitive)
    }

    /**
     * Returns a set of all other layer-ids that this layer needs to function.
     * E.g. if this layers does snap to another layer in the preset, this other layer id will be mentioned
     */
    public getDependencies(): Set<string>{
        const deps = new Set<string>()

        for (const preset of this.presets ?? []) {
            if(preset.preciseInput?.snapToLayers === undefined){
                continue
            }
            preset.preciseInput?.snapToLayers?.forEach(id => {
                deps.add(id);
            })
        }
        
        return deps
    }
}