import {UIEventSource} from "../Logic/UIEventSource";
import BaseUIElement from "./BaseUIElement";

export interface SpecialVisualization {
    funcName: string
    constr: (
        state: any, /*FeaturePipelineState*/
        tagSource: UIEventSource<any>,
        argument: string[],
        guistate: any /*DefaultGuiState*/
    ) => BaseUIElement
    docs: string | BaseUIElement
    example?: string
    args: { name: string; defaultValue?: string; doc: string; required?: false | boolean }[]
    getLayerDependencies?: (argument: string[]) => string[]
}
