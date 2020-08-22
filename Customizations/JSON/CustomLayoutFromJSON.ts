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


export interface TagRenderingConfigJson {   
    // If this key is present, then...
    key?: string,
    // Use this string to render
    render: string,
    // One of string, int, nat, float, pfloat, email, phone. Default: string
    type?: string,
    // If it is not known (and no mapping below matches), this question is asked; a textfield is inserted in the rendering above
    question?: string,
    // If a value is added with the textfield, this extra tag is addded. Optional field
    addExtraTags?: string | string[] | { k: string, v: string }[];
    // Alternatively, these tags are shown if they match - even if the key above is not there
    // If unknown, these become a radio button
    mappings?:
        {
            if: string,
            then: string
        }[]
}

export interface LayerConfigJson {

    id: string;
    icon: TagRenderingConfigJson;
    title: TagRenderingConfigJson;
    description: string;
    minzoom: number,
    color: TagRenderingConfigJson;
    width: TagRenderingConfigJson;
    overpassTags: string | string[] | { k: string, v: string }[];
    wayHandling: number,
    presets: [
        {
            // icon: optional. Uses the layer icon by default
            icon?: string;
            // title: optional. Uses the layer title by default
            title?: string;
            // description: optional. Uses the layer description by default
            description?: string;
            // tags: optional list {k:string, v:string}[]
            tags?: string | string[] | { k: string, v: string }[]
        }
    ],
    tagRenderings: TagRenderingConfigJson []
}

export interface LayoutConfigJson {
    name: string;
    title: string;
    description: string;
    maintainer: string;
    language: string[];
    layers: LayerConfigJson[],
    startZoom: number;
    startLat: number;
    startLon: number;
    /**
     * Either a URL or a base64 encoded value (which should include 'data:image/svg+xml;base64,'
     */
    icon: string;
}

export class CustomLayoutFromJSON {


    public static FromQueryParam(layoutFromBase64: string): Layout {
        return CustomLayoutFromJSON.LayoutFromJSON(JSON.parse(atob(layoutFromBase64)));
    }

    public static TagRenderingFromJson(json: any): TagDependantUIElementConstructor {

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

    private static StyleFromJson(layout: any, styleJson: any): ((tags: any) => {
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
            const stroke = colourRendering.GetContent(tags);
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
        if (json.indexOf("!=") >= 0) {
            kv = json.split("!=");
            invert = true;
        } else {
            kv = json.split("=");
        }

        if (kv.length !== 2) {
            return undefined;
        }
        if (kv[0].trim() === "") {
            return undefined;
        }
        return new Tag(kv[0].trim(), kv[1].trim(), invert);
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
            tags = json.map(CustomLayoutFromJSON.TagFromJson);
        }
        for (const tag of tags) {
            if (tag === undefined) {
                return undefined;
            }
        }
        return tags;
    }

    private static LayerFromJson(json: any): LayerDefinition {
        const t = CustomLayoutFromJSON.MaybeTranslation;
        const tr = CustomLayoutFromJSON.TagRenderingFromJson;
        const tags = CustomLayoutFromJSON.TagsFromJson(json.overpassTags);
        // We run the icon rendering with the bare minimum of tags (the overpass tags) to get the actual icon
        const properties = {};
        for (const tag of tags) {
            tags[tag.key] = tag.value;
        }
        const icon = CustomLayoutFromJSON.TagRenderingFromJson(json.icon).construct({
            tags: new UIEventSource<any>(properties)
        }).InnerRender();


        return new LayerDefinition(
            json.id,
            {
                description: t(json.description),
                name: t(json.title.render),
                icon: icon,
                minzoom: json.minzoom,
                title: tr(json.title),
                presets: json.presets.map((preset) => {
                    return CustomLayoutFromJSON.PresetFromJson(json, preset)
                }),
                elementsToShow:
                    [new ImageCarouselWithUploadConstructor()].concat(json.tagRenderings.map(tr)),
                overpassFilter: new And(tags),
                wayHandling: parseInt(json.wayHandling) ?? LayerDefinition.WAYHANDLING_CENTER_AND_WAY,
                maxAllowedOverlapPercentage: 0,
                style: CustomLayoutFromJSON.StyleFromJson(json, json.style)
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

    public static LayoutFromJSON(json: any) {
        const t = CustomLayoutFromJSON.MaybeTranslation;
        let languages = json.language;
        if(typeof (json.language) === "string"){
            languages = [json.language];
        }
        const layout = new Layout(json.name,
            languages,
            t(json.title),
            json.layers.map(CustomLayoutFromJSON.LayerFromJson),
            json.startZoom,
            json.startLat,
            json.startLon,
            new Combine(['<h3>', t(json.title), '</h3><br/>', t(json.description)])
        );
        layout.icon = json.icon;
        layout.maintainer = json.maintainer;
        return layout;
    }

}