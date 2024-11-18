import { Store } from "../../Logic/UIEventSource"
import BaseUIElement from "../BaseUIElement"
import Combine from "../Base/Combine"
import { SubtleButton } from "../Base/SubtleButton"
import { FixedUiElement } from "../Base/FixedUiElement"
import Translations from "../i18n/Translations"
import { VariableUiElement } from "../Base/VariableUIElement"
import ChangeTagAction from "../../Logic/Osm/Actions/ChangeTagAction"
import { Tag } from "../../Logic/Tags/Tag"
import { And } from "../../Logic/Tags/And"
import Toggle from "../Input/Toggle"
import { SpecialVisualizationState } from "../SpecialVisualization"

export interface MultiApplyParams {
    featureIds: Store<string[]>
    keysToApply: string[]
    text: string
    autoapply: boolean
    overwrite: boolean
    tagsSource: Store<any>
    state: SpecialVisualizationState
}

class MultiApplyExecutor {
    private static executorCache = new Map<string, MultiApplyExecutor>()
    private readonly originalValues = new Map<string, string>()
    private readonly params: MultiApplyParams

    private constructor(params: MultiApplyParams) {
        this.params = params
        const p = params

        for (const key of p.keysToApply) {
            this.originalValues.set(key, p.tagsSource.data[key])
        }

        if (p.autoapply) {
            const self = this
            const relevantValues = p.tagsSource.map((tags) => {
                const currentValues = p.keysToApply.map((key) => tags[key])
                // By stringifying, we have a very clear ping when they changec
                return JSON.stringify(currentValues)
            })
            relevantValues.addCallbackD((_) => {
                self.applyTaggingOnOtherFeatures()
            })
        }
    }

    public static GetApplicator(id: string, params: MultiApplyParams): MultiApplyExecutor {
        if (MultiApplyExecutor.executorCache.has(id)) {
            return MultiApplyExecutor.executorCache.get(id)
        }
        const applicator = new MultiApplyExecutor(params)
        MultiApplyExecutor.executorCache.set(id, applicator)
        return applicator
    }

    public applyTaggingOnOtherFeatures() {
        console.log("Multi-applying changes...")
        const featuresToChange = this.params.featureIds.data
        const changes = this.params.state.changes
        const allElements = this.params.state.featureProperties
        const keysToChange = this.params.keysToApply
        const overwrite = this.params.overwrite
        const selfTags = this.params.tagsSource.data
        const theme = this.params.state.theme.id
        for (const id of featuresToChange) {
            const tagsToApply: Tag[] = []
            const otherFeatureTags = allElements.getStore(id).data
            for (const key of keysToChange) {
                const newValue = selfTags[key]
                if (newValue === undefined) {
                    continue
                }
                const otherValue = otherFeatureTags[key]
                if (newValue === otherValue) {
                    continue // No changes to be made
                }

                if (overwrite) {
                    tagsToApply.push(new Tag(key, newValue))
                    continue
                }

                if (
                    otherValue === undefined ||
                    otherValue === "" ||
                    otherValue === this.originalValues.get(key)
                ) {
                    tagsToApply.push(new Tag(key, newValue))
                }
            }

            if (tagsToApply.length == 0) {
                continue
            }

            changes.applyAction(
                new ChangeTagAction(id, new And(tagsToApply), otherFeatureTags, {
                    theme,
                    changeType: "answer",
                })
            )
        }
    }
}

export default class MultiApply extends Toggle {
    constructor(params: MultiApplyParams) {
        const p = params
        const t = Translations.t.multi_apply

        const featureId = p.tagsSource.data.id

        if (featureId === undefined) {
            throw "MultiApply needs a feature id"
        }

        const applicator = MultiApplyExecutor.GetApplicator(featureId, params)

        const elems: (string | BaseUIElement)[] = []
        if (p.autoapply) {
            elems.push(new FixedUiElement(p.text).SetClass("block"))
            elems.push(
                new VariableUiElement(
                    p.featureIds.map((featureIds) =>
                        t.autoApply.Subs({
                            attr_names: p.keysToApply.join(", "),
                            count: "" + featureIds.length,
                        })
                    )
                ).SetClass("block subtle text-sm")
            )
        } else {
            elems.push(
                new SubtleButton(undefined, p.text).onClick(() =>
                    applicator.applyTaggingOnOtherFeatures()
                )
            )
        }

        const isShown: Store<boolean> = p.state.osmConnection.isLoggedIn.map(
            (loggedIn) => {
                return loggedIn && p.featureIds.data.length > 0
            },
            [p.featureIds]
        )
        super(new Combine(elems), undefined, isShown)
    }
}
