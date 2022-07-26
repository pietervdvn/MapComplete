

import * as onwheels from "./assets/generated/themes/onwheels.json"
import FeaturePipelineState from "./Logic/State/FeaturePipelineState";
import LayoutConfig from "./Models/ThemeConfig/LayoutConfig";

const layout = new LayoutConfig(<any> onwheels, true)

new FeaturePipelineState(layout)