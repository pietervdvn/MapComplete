import {UIEventSource} from "../../Logic/UIEventSource";
import Combine from "../Base/Combine";
import BaseUIElement from "../BaseUIElement";
import {SubtleButton} from "../Base/SubtleButton";
import Svg from "../../Svg";
import Translations from "../i18n/Translations";
import {VariableUiElement} from "../Base/VariableUIElement";
import Toggle from "../Input/Toggle";
import {UIElement} from "../UIElement";

export interface FlowStep<T> extends BaseUIElement{
    readonly IsValid: UIEventSource<boolean>
    readonly Value: UIEventSource<T>
}

export class FlowPanelFactory<T> {
    private _initial: FlowStep<any>;
    private _steps: ((x: any) => FlowStep<any>)[];
    private _stepNames: string[];
    
    private constructor(initial: FlowStep<any>, steps: ((x:any) => FlowStep<any>)[], stepNames: string[]) {
        this._initial = initial;
        this._steps = steps;
        this._stepNames = stepNames;
    }
    
    public static start<TOut> (step: FlowStep<TOut>): FlowPanelFactory<TOut>{
        return new FlowPanelFactory(step, [], [])
    }
    
    public then<TOut>(name: string, construct: ((t:T) => FlowStep<TOut>)): FlowPanelFactory<TOut>{
        return new FlowPanelFactory<TOut>(
            this._initial,
            this._steps.concat([construct]),
            this._stepNames.concat([name])
        )
    }
    
    public finish(construct: ((t: T, backButton?: BaseUIElement) => BaseUIElement)) : BaseUIElement {
        // Construct all the flowpanels step by step (in reverse order)
        const nextConstr : ((t:any, back?: UIElement) => BaseUIElement)[] = this._steps.map(_ => undefined)
        nextConstr.push(construct)
        
        for (let i = this._steps.length - 1; i >= 0; i--){
            const createFlowStep : (value) => FlowStep<any> = this._steps[i];
            nextConstr[i] = (value, backButton) => {
                console.log("Creating flowSTep ", this._stepNames[i])
                const flowStep = createFlowStep(value)
                return new FlowPanel(flowStep, nextConstr[i + 1], backButton);
            }
        }
        
        return new FlowPanel(this._initial, nextConstr[0],undefined)
    }
    
}

export class FlowPanel<T> extends Toggle {
    
    constructor(
        initial: (FlowStep<T>),
        constructNextstep:  ((input: T, backButton: BaseUIElement) => BaseUIElement),
        backbutton?: BaseUIElement
    ) {
        const t = Translations.t.general;
        
        const currentStepActive = new UIEventSource(true);

        let nextStep: UIEventSource<BaseUIElement>= new UIEventSource<BaseUIElement>(undefined)
        const backButtonForNextStep = new SubtleButton(Svg.back_svg(), t.back).onClick(() => {
            currentStepActive.setData(true)
        })
        
        let elements : (BaseUIElement | string)[] = []
        if(initial !== undefined){
            // Startup the flow
            elements = [
                initial,
                new Combine([
                    backbutton,
                    new Toggle(
                        new SubtleButton(Svg.back_svg().SetStyle("transform: rotate(180deg);"), t.next).onClick(() => {
                            const v = initial.Value.data;
                            nextStep.setData(constructNextstep(v, backButtonForNextStep))
                            currentStepActive.setData(false)
                        }),
                        "Select a valid value to continue",
                        initial.IsValid
                    )
                ]).SetClass("flex w-full justify-end space-x-2")
              
            ]
        }
        
        
        super(
            new Combine(elements).SetClass("h-full flex flex-col justify-between"),
            new VariableUiElement(nextStep),
            currentStepActive
        );
    }
    

    
}