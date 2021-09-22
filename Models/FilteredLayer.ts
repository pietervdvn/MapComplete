import {UIEventSource} from "../Logic/UIEventSource";
import LayerConfig from "./ThemeConfig/LayerConfig";
import {And} from "../Logic/Tags/And";

export default interface FilteredLayer {
    readonly isDisplayed: UIEventSource<boolean>;
    readonly appliedFilters: UIEventSource<And>;
    readonly layerDef: LayerConfig;
}