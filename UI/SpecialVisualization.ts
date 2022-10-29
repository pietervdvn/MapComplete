import {UIEventSource} from "../Logic/UIEventSource";
import BaseUIElement from "./BaseUIElement";
import FeaturePipelineState from "../Logic/State/FeaturePipelineState";
import {DefaultGuiState} from "./DefaultGuiState";

export interface SpecialVisualization {
    funcName: string
    constr: (
        state: FeaturePipelineState,
        tagSource: UIEventSource<any>,
        argument: string[],
        guistate: DefaultGuiState
    ) => BaseUIElement
    docs: string | BaseUIElement
    example?: string
    args: { name: string; defaultValue?: string; doc: string; required?: false | boolean }[]
    getLayerDependencies?: (argument: string[]) => string[]
}
