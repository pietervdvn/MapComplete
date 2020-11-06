import Translations from "../../UI/i18n/Translations";
import TagRenderingConfig from "./TagRenderingConfig";
import {Tag, TagsFilter} from "../../Logic/Tags";
import {LayerConfigJson} from "./LayerConfigJson";
import {FromJSON} from "./FromJSON";
import SharedTagRenderings from "../SharedTagRenderings";
import {TagRenderingConfigJson} from "./TagRenderingConfigJson";
import {Translation} from "../../UI/i18n/Translation";

export default class LayerConfig {
    id: string;

    name: Translation

    description: Translation;
    overpassTags: TagsFilter;

    minzoom: number;

    title: TagRenderingConfig;

    titleIcons: TagRenderingConfig[];

    icon: TagRenderingConfig;
    iconSize: TagRenderingConfig;
    color: TagRenderingConfig;
    width: TagRenderingConfig;
    dashArray: TagRenderingConfig;


    wayHandling: number;

    static WAYHANDLING_DEFAULT = 0;
    static WAYHANDLING_CENTER_ONLY = 1;
    static WAYHANDLING_CENTER_AND_WAY = 2;

    hideUnderlayingFeaturesMinPercentage?: number;

    presets: {
        title: Translation,
        tags: Tag[],
        description?: Translation,
    }[];

    tagRenderings: TagRenderingConfig [];

    constructor(json: LayerConfigJson, context?: string) {
        context = context + "." + json.id;

        this.id = json.id;
        this.name = Translations.T(json.name);
        this.description = Translations.T(json.name);
        this.overpassTags = FromJSON.Tag(json.overpassTags, context + ".overpasstags");
        this.minzoom = json.minzoom;
        this.wayHandling = json.wayHandling ?? 0;
        this.hideUnderlayingFeaturesMinPercentage = json.hideUnderlayingFeaturesMinPercentage ?? 0;
        this.title = new TagRenderingConfig(json.title);
        this.presets = (json.presets ?? []).map(pr =>
            ({
                title: Translations.T(pr.title),
                tags: pr.tags.map(t => FromJSON.SimpleTag(t)),
                description: Translations.T(pr.description)
            }))


        /**
         * Converts a list of tagRenderingCOnfigJSON in to TagRenderingConfig
         * A string is interpreted as a name to call
         * @param tagRenderings
         */
        function trs(tagRenderings?: (string | TagRenderingConfigJson)[]) {
            if (tagRenderings === undefined) {
                return [];
            }
            return tagRenderings.map(
                (renderingJson, i) => {
                    if (typeof renderingJson === "string") {
                        const shared = SharedTagRenderings.SharedTagRendering[renderingJson];
                        if (shared !== undefined) {
                            return shared;
                        }
                        throw `Predefined tagRendering ${renderingJson} not found in ${context}`;
                    }
                    return new TagRenderingConfig(renderingJson, `${context}.tagrendering[${i}]`);
                });
        }

        this.tagRenderings = trs(json.tagRenderings);
        this.titleIcons = trs(json.titleIcons ?? ["wikipedialink","osmlink"]);
        

        function tr(key, deflt) {
            const v = json[key];
            if (v === undefined) {
                return new TagRenderingConfig(deflt);
            }
            if (typeof v === "string") {
                const shared = SharedTagRenderings.SharedTagRendering[v];
                if (shared) {
                    console.log("Got shared TR:", v, "-->", shared)
                    return shared;
                }
            }
            return new TagRenderingConfig(v, context + "." + key);
        }


        this.title = tr("title", "");
        this.icon = tr("icon", "./assets/bug.svg");
        this.iconSize = tr("iconSize", "40,40,center");
        this.color = tr("color", "#0000ff");
        this.width = tr("width", "7");
        this.dashArray = tr("dashArray", "");


    }
}