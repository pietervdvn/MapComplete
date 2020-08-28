import {TagRenderingOptions} from "../TagRenderingOptions";
import {LayerDefinition, Preset} from "../LayerDefinition";
import {Layout} from "../Layout";
import Translation from "../../UI/i18n/Translation";
import Combine from "../../UI/Base/Combine";
import {And, Tag} from "../../Logic/TagsFilter";
import FixedText from "../Questions/FixedText";
import {ImageCarouselWithUploadConstructor} from "../../UI/Image/ImageCarouselWithUpload";
import {UIEventSource} from "../../Logic/UIEventSource";
import {TagDependantUIElementConstructor} from "../UIElementConstructor";
import {Map} from "../Layers/Map";
import {UIElement} from "../../UI/UIElement";
import Translations from "../../UI/i18n/Translations";


export interface TagRenderingConfigJson {   
    // If this key is present, then...
    key?: string,
    // Use this string to render
    render?: string | any,
    // One of string, int, nat, float, pfloat, email, phone. Default: string
    type?: string,
    // If it is not known (and no mapping below matches), this question is asked; a textfield is inserted in the rendering above
    question?: string | any,
    // If a value is added with the textfield, this extra tag is addded. Optional field
    addExtraTags?: string | { k: string, v: string }[];
    // Extra tags: rendering is only shown/asked if these tags are present
    condition?: string;
    // Alternatively, these tags are shown if they match - even if the key above is not there
    // If unknown, these become a radio button
    mappings?:
        {
            if: string,
            then: string | any
        }[]
}

export interface LayerConfigJson {
    name: string;
    title: string | any | TagRenderingConfigJson;
    description: string | any;
    minzoom: number | string,
    icon?: TagRenderingConfigJson;
    color?: TagRenderingConfigJson;
    width?: TagRenderingConfigJson;
    overpassTags: string | { k: string, v: string }[];
    wayHandling?: number,
    widenFactor?: number,
    presets: {
        tags: string,
        title: string | any,
        description?: string | any,
        icon?: string
    }[],
    tagRenderings: TagRenderingConfigJson []
}

export interface LayoutConfigJson {
    widenFactor?: number;
    name: string;
    title: string | any;
    description: string | any;
    maintainer: string;
    language: string | string[];
    layers: LayerConfigJson[],
    startZoom: string | number;
    startLat: string | number;
    startLon: string | number;
    /**
     * Either a URL or a base64 encoded value (which should include 'data:image/svg+xml;base64,'
     */
    icon: string;
}

export class CustomLayoutFromJSON {


    public static FromQueryParam(layoutFromBase64: string): Layout {
        return CustomLayoutFromJSON.LayoutFromJSON(JSON.parse(atob(layoutFromBase64)));
    }

    public static TagRenderingFromJson(json: TagRenderingConfigJson): TagDependantUIElementConstructor {

        if(json === undefined){
            return undefined;
        }
        
        if (typeof (json) === "string") {
            return new FixedText(json);
        }

        let freeform = undefined;
        if (json.render !== undefined) {
            const type = json.type ?? "text";
            let renderTemplate =  CustomLayoutFromJSON.MaybeTranslation(json.render);;
            const template = renderTemplate.replace("{" + json.key + "}", "$" + type + "$");
            if(type === "url"){
                renderTemplate = json.render.replace("{" + json.key + "}", 
                    `<a href='{${json.key}}' target='_blank'>{${json.key}}</a>`
                    );
            }

            freeform = {
                key: json.key,
                template: template,
                renderTemplate: renderTemplate,
                extraTags: CustomLayoutFromJSON.TagsFromJson(json.addExtraTags),
            }
            if (freeform.key === "*") {
                freeform.key = "id"; // Id is always there -> always take the rendering. Used for 'icon' and 'stroke'
            }
        }

        let mappings = undefined;
        if (json.mappings !== undefined) {
            mappings = [];
            for (const mapping of json.mappings) {
                mappings.push({
                    k: new And(CustomLayoutFromJSON.TagsFromJson(mapping.if)), 
                    txt: CustomLayoutFromJSON.MaybeTranslation(mapping.then)
                })
            }
        }

        const rendering = new TagRenderingOptions({
            question: CustomLayoutFromJSON.MaybeTranslation(json.question),
            freeform: freeform,
            mappings: mappings
        });

        if (json.condition) {
            const conditionTags: Tag[] = CustomLayoutFromJSON.TagsFromJson(json.condition);
            return rendering.OnlyShowIf(new And(conditionTags));
        }
        return rendering;
    }

    private static PresetFromJson(layout: any, preset: any): Preset {
        const t = CustomLayoutFromJSON.MaybeTranslation;
        const tags = CustomLayoutFromJSON.TagsFromJson;
        return {
            icon: preset.icon ?? CustomLayoutFromJSON.TagRenderingFromJson(layout.icon),
            tags: tags(preset.tags) ?? tags(layout.overpassTags),
            title: t(preset.title) ?? t(layout.title),
            description: t(preset.description) ?? t(layout.description)
        }
    }

    private static StyleFromJson(layout: LayerConfigJson): ((tags: any) => {
        color: string,
        weight?: number,
        icon: {
            iconUrl: string,
            iconSize: number[],
        },
    }) {
        const iconRendering: TagDependantUIElementConstructor = CustomLayoutFromJSON.TagRenderingFromJson(layout.icon);
        const colourRendering = CustomLayoutFromJSON.TagRenderingFromJson(layout.color);
        let thickness = CustomLayoutFromJSON.TagRenderingFromJson(layout.width);


        return (tags) => {
            const iconUrl = iconRendering.GetContent(tags);
            const stroke = colourRendering.GetContent(tags) ?? "#00f";
            let weight = parseInt(thickness?.GetContent(tags)) ?? 10;
            if(isNaN(weight)){
                weight = 10;
            }
            return {
                color: stroke,
                weight: weight,
                icon: {
                    iconUrl: iconUrl,
                    iconSize: [40, 40],
                },
            }
        };
    }

    private static TagFromJson(json: string | { k: string, v: string }): Tag {
        if (json === undefined) {
            return undefined;
        }
        if (typeof (json) !== "string") {
            return new Tag(json.k.trim(), json.v.trim())
        }

        let kv: string[] = undefined;
        let invert = false;
        let regex = false;
        if (json.indexOf("!=") >= 0) {
            kv = json.split("!=");
            invert = true;
        } else if (json.indexOf("~=") >= 0) {
            kv = json.split("~=");
            regex = true;
        } else {
            kv = json.split("=");
        }

        if (kv.length !== 2) {
            return undefined;
        }
        if (kv[0].trim() === "") {
            return undefined;
        }
        let v = kv[1].trim();
        if(v.startsWith("/") && v.endsWith("/")){
            v = v.substr(1, v.length - 2);
            regex = true;
        }
        return new Tag(kv[0].trim(), regex ? new RegExp(v): v, invert);
    }

    public static TagsFromJson(json: string | { k: string, v: string }[]): Tag[] {
        if (json === undefined) {
            return undefined;
        }
        if (json === "") {
            return [];
        }
        let tags = [];
        if (typeof (json) === "string") {
            tags = json.split("&").map(CustomLayoutFromJSON.TagFromJson);
        } else {
            tags = json.map(x => {CustomLayoutFromJSON.TagFromJson(x)});
        }
        for (const tag of tags) {
            if (tag === undefined) {
                return undefined;
            }
        }
        return tags;
    }

    private static LayerFromJson(json: LayerConfigJson): LayerDefinition {
        const t = CustomLayoutFromJSON.MaybeTranslation;
        const tr = CustomLayoutFromJSON.TagRenderingFromJson;
        const tags = CustomLayoutFromJSON.TagsFromJson(json.overpassTags);
        // We run the icon rendering with the bare minimum of tags (the overpass tags) to get the actual icon
        const icon = CustomLayoutFromJSON.TagRenderingFromJson(json.icon).GetContent({id:"node/-1"});

        // @ts-ignore
        const id = json.name?.replace(/[^a-zA-Z0-9_-]/g,'') ?? json.id;
        return new LayerDefinition(
            id,
            {
                description: t(json.description),
                name: Translations.WT(t(json.name)),
                icon: icon,
                minzoom: parseInt(""+json.minzoom),
                title: tr(json.title),
                presets: json.presets.map((preset) => {
                    return CustomLayoutFromJSON.PresetFromJson(json, preset)
                }),
                elementsToShow:
                    [new ImageCarouselWithUploadConstructor()].concat(json.tagRenderings.map(tr)),
                overpassFilter: new And(tags),
                wayHandling: parseInt(""+json.wayHandling) ?? LayerDefinition.WAYHANDLING_CENTER_AND_WAY,
                maxAllowedOverlapPercentage: 0,
                style: CustomLayoutFromJSON.StyleFromJson(json)
            }
        )
    }


    private static MaybeTranslation(json: any): Translation | string {
        if (json === undefined) {
            return undefined;
        }
        if (typeof (json) === "string") {
            return json;
        }
        return new Translation(json);
    }

    public static LayoutFromJSON(json: LayoutConfigJson) {
        const t = CustomLayoutFromJSON.MaybeTranslation;
        let languages : string[] ;
        if(typeof (json.language) === "string"){
            languages = [json.language];
        }else{
            languages = json.language
        }
        const layout = new Layout(json.name,
            languages,
            t(json.title),
            json.layers.map(CustomLayoutFromJSON.LayerFromJson),
            parseInt(""+json.startZoom),
            parseFloat(""+json.startLat),
            parseFloat(""+json.startLon),
            new Combine(['<h3>', t(json.title), '</h3><br/>', t(json.description)])
        );
        layout.icon = json.icon;
        layout.maintainer = json.maintainer;
        layout.widenFactor = parseFloat(""+json.widenFactor) ?? 0.03;
        if(isNaN(layout.widenFactor)){
            layout.widenFactor = 0.03;
        }
        if (layout.widenFactor > 0.1) {
            layout.widenFactor = 0.1;
        }
        return layout;
    }

}