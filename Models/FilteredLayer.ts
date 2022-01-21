import {UIEventSource} from "../Logic/UIEventSource";
import LayerConfig from "./ThemeConfig/LayerConfig";
import {TagsFilter} from "../Logic/Tags/TagsFilter";

export interface FilterState {
    currentFilter: TagsFilter, state: string | number
}

export default interface FilteredLayer {
    readonly isDisplayed: UIEventSource<boolean>;
    readonly appliedFilters: UIEventSource<Map<string, FilterState>>;
    readonly layerDef: LayerConfig;
}