import {Layout} from "../Layout";
import {LayoutConfigJson} from "./LayoutConfigJson";
import {AndOrTagConfigJson} from "./TagConfigJson";
import {And, Or, RegexTag, Tag, TagsFilter} from "../../Logic/Tags";
import {TagRenderingConfigJson} from "./TagRenderingConfigJson";
import {TagRenderingOptions} from "../TagRenderingOptions";
import Translation from "../../UI/i18n/Translation";
import {LayerConfigJson} from "./LayerConfigJson";
import {LayerDefinition, Preset} from "../LayerDefinition";
import {TagDependantUIElementConstructor} from "../UIElementConstructor";
import Combine from "../../UI/Base/Combine";
import * as drinkingWater from "../../assets/layers/drinking_water/drinking_water.json";
import * as ghostbikes from "../../assets/layers/ghost_bike/ghost_bike.json"
import * as viewpoint from "../../assets/layers/viewpoint/viewpoint.json"
import * as bike_parking from "../../assets/layers/bike_parking/bike_parking.json"
import * as bike_repair_station from "../../assets/layers/bike_repair_station/bike_repair_station.json"
import * as birdhides from "../../assets/layers/bird_hide/birdhides.json"
import * as nature_reserve from "../../assets/layers/nature_reserve/nature_reserve.json"
import * as bike_cafes from "../../assets/layers/bike_cafe/bike_cafes.json"

import {Utils} from "../../Utils";
import ImageCarouselWithUploadConstructor from "../../UI/Image/ImageCarouselWithUpload";
import {ImageCarouselConstructor} from "../../UI/Image/ImageCarousel";
import {State} from "../../State";

export class FromJSON {

    public static sharedLayers: Map<string, LayerDefinition> = FromJSON.getSharedLayers();

    private static getSharedLayers() {
        
        // We inject a function into state while we are busy
        State.FromBase64 = FromJSON.FromBase64;
        
        const sharedLayers = new Map<string, LayerDefinition>();

        const sharedLayersList = [
            FromJSON.Layer(drinkingWater),
            FromJSON.Layer(ghostbikes),
            FromJSON.Layer(viewpoint),
            FromJSON.Layer(bike_parking),
            FromJSON.Layer(bike_repair_station),
            FromJSON.Layer(birdhides),
            FromJSON.Layer(nature_reserve),
            FromJSON.Layer(bike_cafes),
        ];

        for (const layer of sharedLayersList) {
            sharedLayers.set(layer.id, layer);
        }

        return sharedLayers;
    }

    public static FromBase64(layoutFromBase64: string): Layout {
        return FromJSON.LayoutFromJSON(JSON.parse(atob(layoutFromBase64)));
    }

    public static LayoutFromJSON(json: LayoutConfigJson): Layout {
        console.log(json)
        const tr = FromJSON.Translation;

        const layers = json.layers.map(FromJSON.Layer);
        const roaming: TagDependantUIElementConstructor[] = json.roamingRenderings?.map((tr, i) => FromJSON.TagRendering(tr, "Roaming rendering "+i)) ?? [];
        for (const layer of layers) {
            layer.elementsToShow.push(...roaming);
        }

        const layout = new Layout(
            json.id,
            typeof (json.language) === "string" ? [json.language] : json.language,
            tr(json.title ?? "Title not defined"),
            layers,
            json.startZoom,
            json.startLat,
            json.startLon,
            new Combine(["<h3>", tr(json.title), "</h3>", tr(json.description)]),
        );

        layout.widenFactor = json.widenFactor ?? 0.07;
        layout.icon = json.icon;
        layout.maintainer = json.maintainer;
        layout.version = json.version;
        layout.socialImage = json.socialImage;
        layout.changesetMessage = json.changesetmessage;
        return layout;
    }

    public static Translation(json: string | any): string | Translation {
        if (json === undefined) {
            return undefined;
        }
        if (typeof (json) === "string") {
            return json;
        }
        const tr = {};
        let keyCount = 0;
        for (let key in json) {
            keyCount ++;
            tr[key] = json[key]; // I'm doing this wrong, I know
        }
        if(keyCount == 0){
            return undefined;
        }
        return new Translation(tr);
    }

    public static TagRendering(json: TagRenderingConfigJson | string, propertyeName: string): TagDependantUIElementConstructor {
        return FromJSON.TagRenderingWithDefault(json, propertyeName, undefined);
    }

    public static TagRenderingWithDefault(json: TagRenderingConfigJson | string, propertyName, defaultValue: string): TagDependantUIElementConstructor {
        if (json === undefined) {
            if(defaultValue !== undefined){
                return FromJSON.TagRendering(defaultValue, propertyName);
            }
            throw `Tagrendering ${propertyName} is undefined...`
        }

        
        if (typeof json === "string") {
            switch (json) {
                case "picture": {
                    return new ImageCarouselWithUploadConstructor()
                }
                case "pictures": {
                    return new ImageCarouselWithUploadConstructor()
                }
                case "image": {
                    return new ImageCarouselWithUploadConstructor()
                }
                case "images": {
                   return new ImageCarouselWithUploadConstructor()
                }
                case "picturesNoUpload": {
                    return new ImageCarouselConstructor()
                }
            }


            return new TagRenderingOptions({
                freeform: {
                    key: "id",
                    renderTemplate: json,
                    template: "$$$"
                }
            });
        }
        // It's the question that drives us, neo
        const question =  FromJSON.Translation(json.question);

        let template = FromJSON.Translation(json.render);

        let freeform = undefined;
        if (json.freeform?.key && json.freeform.key !== "") {
            // Setup the freeform
            if (template === undefined) {
                console.error("Freeform.key is defined, but render is not. This is not allowed.", json)
                throw `Freeform is defined in tagrendering ${propertyName}, but render is not. This is not allowed.`
            }

            freeform = {
                template: `$${json.freeform.type ?? "string"}$`,
                renderTemplate: template,
                key: json.freeform.key
            };
            if (json.freeform.addExtraTags) {
                freeform.extraTags = new And(json.freeform.addExtraTags.map(FromJSON.SimpleTag))
            }
        } else if (json.render) {
            // Template (aka rendering) is defined, but freeform.key is not. We allow an input as string
            freeform = {
                template: undefined, // Template to ask is undefined -> we block asking for this key
                renderTemplate: template,
                key: "id" // every object always has an id
            }
        }

        const mappings = json.mappings?.map((mapping, i) => {
                const k = FromJSON.Tag(mapping.if, `IN mapping #${i} of tagrendering ${propertyName}`)

                if (question !== undefined && !mapping.hideInAnswer && !k.isUsableAsAnswer()) {
                    throw `Invalid mapping in ${propertyName}: the tags use an OR-expression or regex expression but are also assignable as answer.`
                }

                return {
                    k: k,
                    txt: FromJSON.Translation(mapping.then),
                    hideInAnswer: mapping.hideInAnswer
                };
            }
        );

        if (template === undefined && (mappings === undefined || mappings.length === 0)) {
            console.error(`Empty tagrendering detected in ${propertyName}: no mappings nor template given`, json)
            throw `Empty tagrendering ${propertyName} detected: no mappings nor template given`
        }


        let rendering = new TagRenderingOptions({
            question: question,
            freeform: freeform,
            mappings: mappings,
            multiAnswer: json.multiAnswer
        });
        
        if (json.condition) {
            const condition = FromJSON.Tag(json.condition, `In tagrendering ${propertyName}.condition`);
            return rendering.OnlyShowIf(condition);
        }

        return rendering;
    }

    public static SimpleTag(json: string): Tag {
        const tag = Utils.SplitFirst(json, "=");
        return new Tag(tag[0], tag[1]);
    }

    public static Tag(json: AndOrTagConfigJson | string, context: string = ""): TagsFilter {
        if(json === undefined){
            throw "Error while parsing a tag: nothing defined. Make sure all the tags are defined and at least one tag is present in a complex expression"
        }
        if (typeof (json) == "string") {
            const tag = json as string;
            if (tag.indexOf("!~") >= 0) {
                const split = Utils.SplitFirst(tag, "!~");
                if (split[1] === "*") {
                    throw `Don't use 'key!~*' - use 'key=' instead (empty string as value (in the tag ${tag} while parsing ${context})`
                }
                return new RegexTag(
                    split[0],
                    new RegExp("^" + split[1] + "$"),
                    true
                );
            }
            if (tag.indexOf("~~") >= 0) {
                const split = Utils.SplitFirst(tag, "~~");
                if (split[1] === "*") {
                    split[1] = "..*"
                }
                return new RegexTag(
                        new RegExp("^" + split[0] + "$"),
                    new RegExp("^" + split[1] + "$")
                );
            }
            if (tag.indexOf("!=") >= 0) {
                const split = Utils.SplitFirst(tag, "!=");
                if (split[1] === "*") {
                    split[1] = "..*"
                }
                return new RegexTag(
                    split[0],
                    new RegExp("^" + split[1] + "$"),
                    true
                );
            }
            if (tag.indexOf("~") >= 0) {
                const split = Utils.SplitFirst(tag, "~");
                if (split[1] === "*") {
                    split[1] = "..*"
                }
                return new RegexTag(
                    split[0],
                    new RegExp("^" + split[1] + "$")
                );
            }
            const split = Utils.SplitFirst(tag, "=");
            if(split[1] == "*"){
                throw `Error while parsing tag '${tag}' in ${context}: detected a wildcard on a normal value. Use a regex pattern instead`
            }
            return new Tag(split[0], split[1])
        }
        if (json.and !== undefined) {
            return new And(json.and.map(t => FromJSON.Tag(t, context)));
        }
        if (json.or !== undefined) {
            return new Or(json.or.map(t => FromJSON.Tag(t, context)));
        }
    }

    public static Layer(json: LayerConfigJson | string): LayerDefinition {
        if (typeof (json) === "string") {
            const cached = FromJSON.sharedLayers.get(json);
            if (cached) {
                return cached;
            }
            throw `Layer ${json} not yet loaded...`
        }
        try {
            return FromJSON.LayerUncaught(json);
        } catch (e) {
            throw `While parsing layer ${json.id}: ${e}`
        }
    }

    private static LayerUncaught(json: LayerConfigJson): LayerDefinition {

        const tr = FromJSON.Translation;
        const overpassTags = FromJSON.Tag(json.overpassTags, "overpasstags for layer "+json.id);
        const icon = FromJSON.TagRenderingWithDefault(json.icon, "icon", "./assets/bug.svg");
        const iconSize = FromJSON.TagRenderingWithDefault(json.iconSize, "iconSize", "40,40,center");
        const color = FromJSON.TagRenderingWithDefault(json.color, "color", "#0000ff");
        const width = FromJSON.TagRenderingWithDefault(json.width, "width", "10");
        if (json.title === "Layer") {
            json.title = {};
        }
        let title = FromJSON.TagRendering(json.title, "Popup title");


        let tagRenderingDefs = json.tagRenderings ?? [];
        let hasImageElement = false;
        for (const tagRenderingDef of tagRenderingDefs) {
            if (typeof tagRenderingDef !== "string") {
                continue;
            }
            let str = tagRenderingDef as string;
            if (tagRenderingDef.indexOf("images") >= 0 || str.indexOf("pictures") >= 0) {
                hasImageElement = true;
                break;
            }
        }
        if (!hasImageElement) {
            tagRenderingDefs = ["images", ...tagRenderingDefs];
        }
        let tagRenderings = tagRenderingDefs.map((tr, i) => FromJSON.TagRendering(tr, "Tagrendering #"+i));


        const renderTags = {"id": "node/-1"}
        const presets: Preset[] = json?.presets?.map(preset => {
            return ({
                title: tr(preset.title),
                description: tr(preset.description),
                tags: preset.tags.map(FromJSON.SimpleTag)
            });
        }) ?? [];

        function style(tags) {
            const iconSizeStr =
                iconSize.GetContent(tags).txt.split(",");
            const iconwidth = Number(iconSizeStr[0]);
            const iconheight = Number(iconSizeStr[1]);
            const iconmode = iconSizeStr[2];
            const iconAnchor = [iconwidth / 2, iconheight / 2] // x, y
            // If iconAnchor is set to [0,0], then the top-left of the icon will be placed at the geographical location
            if (iconmode.indexOf("left") >= 0) {
                iconAnchor[0] = 0;
            }
            if (iconmode.indexOf("right") >= 0) {
                iconAnchor[0] = iconwidth;
            }

            if (iconmode.indexOf("top") >= 0) {
                iconAnchor[1] = 0;
            }
            if (iconmode.indexOf("bottom") >= 0) {
                iconAnchor[1] = iconheight;
            }

            // the anchor is always set from the center of the point
            // x, y with x going right and y going down if the values are bigger
            const popupAnchor = [0, 3 - iconAnchor[1]];

            return {
                color: color.GetContent(tags).txt,
                weight: width.GetContent(tags).txt,
                icon: {
                    iconUrl: icon.GetContent(tags).txt,
                    iconSize: [iconwidth, iconheight],
                    popupAnchor: popupAnchor,
                    iconAnchor: iconAnchor
                },
            }
        }

        const layer = new LayerDefinition(
            json.id,
            {
                name: tr(json.name),
                description: tr(json.description),
                icon: icon.GetContent(renderTags).txt,
                overpassFilter: overpassTags,

                title: title,
                minzoom: json.minzoom,
                presets: presets,
                elementsToShow: tagRenderings,
                style: style,
                wayHandling: json.wayHandling

            }
        );
        layer.maxAllowedOverlapPercentage = json.hideUnderlayingFeaturesMinPercentage;
        return layer;
    }

}