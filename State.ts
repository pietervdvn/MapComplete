import LayoutConfig from "./Models/ThemeConfig/LayoutConfig";
import FeaturePipelineState from "./Logic/State/FeaturePipelineState";

/**
 * Contains the global state: a bunch of UI-event sources
 */

export default class State extends FeaturePipelineState {
    /* The singleton of the global state
     */
    public static state: FeaturePipelineState;

    constructor(layoutToUse: LayoutConfig) {
        super(layoutToUse)
        window["mapcomplete_state"]= this;
    }


}
