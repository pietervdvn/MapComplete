import {UIEventSource} from "../../Logic/UIEventSource";
import Combine from "../Base/Combine";
import BaseUIElement from "../BaseUIElement";
import {SubtleButton} from "../Base/SubtleButton";
import Svg from "../../Svg";
import Translations from "../i18n/Translations";
import {VariableUiElement} from "../Base/VariableUIElement";
import Toggle from "../Input/Toggle";
import {UIElement} from "../UIElement";
import {FixedUiElement} from "../Base/FixedUiElement";

export interface FlowStep<T> extends BaseUIElement {
    readonly IsValid: UIEventSource<boolean>
    readonly Value: UIEventSource<T>
}

export class FlowPanelFactory<T> {
    private _initial: FlowStep<any>;
    private _steps: ((x: any) => FlowStep<any>)[];
    private _stepNames: (string | BaseUIElement)[];

    private constructor(initial: FlowStep<any>, steps: ((x: any) => FlowStep<any>)[], stepNames: (string | BaseUIElement)[]) {
        this._initial = initial;
        this._steps = steps;
        this._stepNames = stepNames;
    }

    public static start<TOut>(name: string | BaseUIElement, step: FlowStep<TOut>): FlowPanelFactory<TOut> {
        return new FlowPanelFactory(step, [], [name])
    }

    public then<TOut>(name: string | BaseUIElement, construct: ((t: T) => FlowStep<TOut>)): FlowPanelFactory<TOut> {
        return new FlowPanelFactory<TOut>(
            this._initial,
            this._steps.concat([construct]),
            this._stepNames.concat([name])
        )
    }

    public finish(name: string | BaseUIElement, construct: ((t: T, backButton?: BaseUIElement) => BaseUIElement)): {
        flow: BaseUIElement,
        furthestStep: UIEventSource<number>,
        titles: (string | BaseUIElement)[]
    } {
        const furthestStep = new UIEventSource(0)
        // Construct all the flowpanels step by step (in reverse order)
        const nextConstr: ((t: any, back?: UIElement) => BaseUIElement)[] = this._steps.map(_ => undefined)
        nextConstr.push(construct)
        for (let i = this._steps.length - 1; i >= 0; i--) {
            const createFlowStep: (value) => FlowStep<any> = this._steps[i];
            const isConfirm = i == this._steps.length - 1;
            nextConstr[i] = (value, backButton) => {
                const flowStep = createFlowStep(value)
                furthestStep.setData(i + 1);
                const panel = new FlowPanel(flowStep, nextConstr[i + 1], backButton, isConfirm);
                panel.isActive.addCallbackAndRun(active => {
                    if (active) {
                        furthestStep.setData(i + 1);
                    }
                })
                return panel
            }
        }

        const flow = new FlowPanel(this._initial, nextConstr[0])
        flow.isActive.addCallbackAndRun(active => {
            if (active) {
                furthestStep.setData(0);
            }
        })
        return {
            flow,
            furthestStep,
            titles: this._stepNames
        }
    }

}

export class FlowPanel<T> extends Toggle {
    public isActive: UIEventSource<boolean>

    constructor(
        initial: (FlowStep<T>),
        constructNextstep: ((input: T, backButton: BaseUIElement) => BaseUIElement),
        backbutton?: BaseUIElement,
        isConfirm = false
    ) {
        const t = Translations.t.general;

        const currentStepActive = new UIEventSource(true);

        let nextStep: UIEventSource<BaseUIElement> = new UIEventSource<BaseUIElement>(undefined)
        const backButtonForNextStep = new SubtleButton(Svg.back_svg(), t.back).onClick(() => {
            currentStepActive.setData(true)
        })

        let elements: (BaseUIElement | string)[] = []
        const isError = new UIEventSource(false)
        if (initial !== undefined) {
            // Startup the flow
            elements = [
                initial,
      
                new Combine([
                    backbutton,
                    new Toggle(
                        new SubtleButton(
                            isConfirm ? Svg.checkmark_svg() :
                                Svg.back_svg().SetStyle("transform: rotate(180deg);"),
                            isConfirm ? t.confirm : t.next
                        ).onClick(() => {
                            try {

                                const v = initial.Value.data;
                                nextStep.setData(constructNextstep(v, backButtonForNextStep))
                                currentStepActive.setData(false)
                            } catch (e) {
                                console.error(e)
                                isError.setData(true)
                            }
                        }),
                        "Select a valid value to continue",
                        initial.IsValid
                    ),
                    new Toggle(
                        new FixedUiElement("Something went wrong...").SetClass("alert"),
                        undefined,
                        isError),
                ]).SetClass("flex w-full justify-end space-x-2"),


            ]
        }


        super(
            new Combine(elements).SetClass("h-full flex flex-col justify-between"),
            new VariableUiElement(nextStep),
            currentStepActive
        );
        this.isActive = currentStepActive
    }


}