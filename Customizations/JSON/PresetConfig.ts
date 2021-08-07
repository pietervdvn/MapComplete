import {Translation} from "../../UI/i18n/Translation";
import {Tag} from "../../Logic/Tags/Tag";

export default interface PresetConfig {
    title: Translation,
    tags: Tag[],
    description?: Translation,
    /**
     * If precise input is set, then an extra map is shown in which the user can drag the map to the precise location
     */
    preciseInput?: {
        preferredBackground?: string[],
        snapToLayers?: string[],
        maxSnapDistance?: number
    }
}