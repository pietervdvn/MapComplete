import {Translation} from "../../UI/i18n/Translation";
import SourceConfig from "./SourceConfig";
import TagRenderingConfig from "./TagRenderingConfig";
import {TagsFilter} from "../../Logic/Tags/TagsFilter";
import PresetConfig from "./PresetConfig";
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

export default class LayerConfig extends WithContextLoader {

    id: string;
    name: Translation;
    description: Translation;
    source: SourceConfig;
    calculatedTags: [string, string][];
    doNotDownload: boolean;
    passAllFeatures: boolean;
    isShown: TagRenderingConfig;
    minzoom: number;
    minzoomVisible: number;
    maxzoom: number;
    title?: TagRenderingConfig;
    titleIcons: TagRenderingConfig[];

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

    presets: PresetConfig[];

    tagRenderings: TagRenderingConfig[];
    filters: FilterConfig[];

    constructor(
        json: LayerConfigJson,
        context?: string,
        official: boolean = true
    ) {
        context = context + "." + json.id;
        super(json, context)
        this.id = json.id;
        let legacy = undefined;
        if (json["overpassTags"] !== undefined) {
            // @ts-ignore
            legacy = TagUtils.Tag(json["overpassTags"], context + ".overpasstags");
        }

        if (json.source !== undefined) {
            this.maxAgeOfCache = json.source.maxCacheAge ?? 24 * 60 * 60 * 30
            if (legacy !== undefined) {
                throw (
                    context +
                    "Both the legacy 'layer.overpasstags' and the new 'layer.source'-field are defined"
                );
            }

            let osmTags: TagsFilter = legacy;
            if (json.source["osmTags"]) {
                osmTags = TagUtils.Tag(
                    json.source["osmTags"],
                    context + "source.osmTags"
                );
            }

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
                },
                json.id
            );
        }else if(legacy === undefined){
            throw "No valid source defined ("+context+")"
        } else {
            this.source = new SourceConfig({
                osmTags: legacy,
            });
        }


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

            let preciseInput: any = {
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
                    snapToLayers: snapToLayers,
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

        this.mapRendering = json.mapRendering
            .filter(r => r["icon"] !== undefined || r["label"] !== undefined)
            .map((r, i) => new PointRenderingConfig(<PointRenderingConfigJson>r, context + ".mapRendering[" + i + "]"))

        this.lineRendering = json.mapRendering
            .filter(r => r["icon"] === undefined && r["label"] === undefined)
            .map((r, i) => new LineRenderingConfig(<LineRenderingConfigJson>r, context + ".mapRendering[" + i + "]"))


        this.tagRenderings = this.ExtractLayerTagRenderings(json)
        const missingIds = json.tagRenderings?.filter(tr => typeof tr !== "string" && tr["builtin"] === undefined && tr["id"] === undefined && tr["rewrite"] === undefined) ?? [];

        if (missingIds.length > 0 && official) {
            console.error("Some tagRenderings of", this.id, "are missing an id:", missingIds)
            throw "Missing ids in tagrenderings"
        }

        this.filters = (json.filter ?? []).map((option, i) => {
            return new FilterConfig(option, `${context}.filter-[${i}]`)
        });

        if (json["filters"] !== undefined) {
            throw "Error in " + context + ": use 'filter' instead of 'filters'"
        }

        const titleIcons = [];
        const defaultIcons = [
            "phonelink",
            "emaillink",
            "wikipedialink",
            "osmlink",
            "sharelink",
        ];
        for (const icon of json.titleIcons ?? defaultIcons) {
            if (icon === "defaults") {
                titleIcons.push(...defaultIcons);
            } else {
                titleIcons.push(icon);
            }
        }

        this.titleIcons = this.ParseTagRenderings(titleIcons, true);

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

    public ExtractLayerTagRenderings(json: LayerConfigJson): TagRenderingConfig[] {

        if (json.tagRenderings === undefined) {
            return []
        }

        const normalTagRenderings: (string | { builtin: string, override: any } | TagRenderingConfigJson)[] = []

        
        const renderingsToRewrite: ({ rewrite:{
                sourceString: string,
                into: string[]
            }, renderings: (string | { builtin: string, override: any } | TagRenderingConfigJson)[] })[] = []
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

        const allRenderings = this.ParseTagRenderings(normalTagRenderings, false);

        if(renderingsToRewrite.length === 0){
            return allRenderings
        }
        
        function prepConfig(keyToRewrite: string, target:string, tr: TagRenderingConfigJson){
            
            function replaceRecursive(transl: string | any){
                if(typeof transl === "string"){
                    return transl.replace(keyToRewrite, target)
                }
                if(transl.map !== undefined){
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
            
            tr.id = target+"-"+orig.id
            tr.group = target
            return tr
        }

        const rewriteGroups: Map<string, TagRenderingConfig[]> = new Map<string, TagRenderingConfig[]>()
        for (const rewriteGroup of renderingsToRewrite) {
            
            const tagRenderings = rewriteGroup.renderings
            const textToReplace = rewriteGroup.rewrite.sourceString
            const targets = rewriteGroup.rewrite.into
            for (const target of targets) {
                const parsedRenderings = this.ParseTagRenderings(tagRenderings, false, tr => prepConfig(textToReplace, target, tr))
                
                if(!rewriteGroups.has(target)){
                    rewriteGroups.set(target, [])
                }
                rewriteGroups.get(target).push(... parsedRenderings)
            }
        }
        
        
        rewriteGroups.forEach((group, groupName) => {
            group.push(new TagRenderingConfig({
                id:"questions",
                group:groupName
            }))
        })
        
        rewriteGroups.forEach(group => {
            allRenderings.push(...group)
        })


        return allRenderings;

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
}