import {UIEventSource} from "../Logic/UIEventSource";
import LayerConfig from "./ThemeConfig/LayerConfig";
import {And} from "../Logic/Tags/And";
import FilterConfig from "./ThemeConfig/FilterConfig";

export default interface FilteredLayer {
    readonly isDisplayed: UIEventSource<boolean>;
    readonly appliedFilters: UIEventSource<{filter: FilterConfig, selected: number}[]>;
    readonly layerDef: LayerConfig;
}