import {UIEventSource} from "../Logic/UIEventSource";
import {TagsFilter} from "../Logic/Tags/TagsFilter";
import LayerConfig from "../Customizations/JSON/LayerConfig";

export default interface FilteredLayer {
    readonly isDisplayed: UIEventSource<boolean>;
    readonly appliedFilters: UIEventSource<TagsFilter>;
    readonly layerDef: LayerConfig;
}