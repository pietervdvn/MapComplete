import { SpecialVisualization, SpecialVisualizationState } from "../SpecialVisualization"
import { MangroveReviews } from "mangrove-reviews-typescript"
import FeatureReviews from "../../Logic/Web/MangroveReviews"
import SvelteUIElement from "../Base/SvelteUIElement"
import StarsBarIcon from "../Reviews/StarsBarIcon.svelte"
import ReviewForm from "../Reviews/ReviewForm.svelte"
import AllReviews from "../Reviews/AllReviews.svelte"
import { UIEventSource } from "../../Logic/UIEventSource"
import ImportReviewIdentity from "../Reviews/ImportReviewIdentity.svelte"
import { Feature } from "geojson"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
import BaseUIElement from "../BaseUIElement"
import Combine from "../Base/Combine"

export class ReviewSpecialVisualisations {
    public static initList(): (SpecialVisualization & { group })[] {
        const createReview: SpecialVisualization & { group } = {
            funcName: "create_review",
            group: "reviews",

            docs: "Invites the contributor to leave a review. Somewhat small UI-element until interacted",
            needsUrls: [MangroveReviews.ORIGINAL_API],
            args: [
                {
                    name: "subjectKey",
                    defaultValue: "name",
                    doc: "The key to use to determine the subject. If specified, the subject will be <b>tags[subjectKey]</b>"
                },
                {
                    name: "fallback",
                    doc: "The identifier to use, if <i>tags[subjectKey]</i> as specified above is not available. This is effectively a fallback value"
                },
                {
                    name: "question",
                    doc: "The question to ask during the review"
                }
            ],
            constr: (state, tags, args, feature, layer) => {
                const nameKey = args[0] ?? "name"
                const fallbackName = args[1]
                const question = args[2]
                const reviews = FeatureReviews.construct(
                    feature,
                    tags,
                    state.userRelatedState?.mangroveIdentity,
                    {
                        nameKey: nameKey,
                        fallbackName
                    },
                    state.featureSwitchIsTesting
                )
                return new SvelteUIElement(ReviewForm, {
                    reviews,
                    state,
                    tags,
                    feature,
                    layer,
                    question
                })
            }
        }
        const listReviews: SpecialVisualization & { group } = {
            funcName: "list_reviews",
            group: "reviews",

            docs: "Adds an overview of the mangrove-reviews of this object. Mangrove.Reviews needs - in order to identify the reviewed object - a coordinate and a name. By default, the name of the object is given, but this can be overwritten",
            needsUrls: [MangroveReviews.ORIGINAL_API],
            args: [
                {
                    name: "subjectKey",
                    defaultValue: "name",
                    doc: "The key to use to determine the subject. If specified, the subject will be <b>tags[subjectKey]</b>"
                },
                {
                    name: "fallback",
                    doc: "The identifier to use, if <i>tags[subjectKey]</i> as specified above is not available. This is effectively a fallback value"
                }
            ],
            constr: (state, tags, args, feature, layer) => {
                const nameKey = args[0] ?? "name"
                const fallbackName = args[1]
                const reviews = FeatureReviews.construct(
                    feature,
                    tags,
                    state.userRelatedState?.mangroveIdentity,
                    {
                        nameKey: nameKey,
                        fallbackName
                    },
                    state.featureSwitchIsTesting
                )
                return new SvelteUIElement(AllReviews, { reviews, state, tags, feature, layer })
            }
        }
        return [
            {
                funcName: "rating",
                group: "reviews",
                docs: "Shows stars which represent the average rating on mangrove.",
                needsUrls: [MangroveReviews.ORIGINAL_API],
                args: [
                    {
                        name: "subjectKey",
                        defaultValue: "name",
                        doc: "The key to use to determine the subject. If the value is specified, the subject will be <b>tags[subjectKey]</b> and will use this to filter the reviews."
                    },
                    {
                        name: "fallback",
                        doc: "The identifier to use, if <i>tags[subjectKey]</i> as specified above is not available. This is effectively a fallback value"
                    }
                ],
                constr: (state, tags, args, feature) => {
                    const nameKey = args[0] ?? "name"
                    const fallbackName = args[1]
                    const reviews = FeatureReviews.construct(
                        feature,
                        tags,
                        state.userRelatedState.mangroveIdentity,
                        {
                            nameKey: nameKey,
                            fallbackName
                        },
                        state.featureSwitchIsTesting
                    )
                    return new SvelteUIElement(StarsBarIcon, {
                        score: reviews.average
                    })
                }
            },
            createReview,
            listReviews,
            {
                funcName: "import_mangrove_key",
                group: "settings",

                docs: "Only makes sense in the usersettings. Allows to import a mangrove public key and to use this to make reviews",
                args: [
                    {
                        name: "text",
                        doc: "The text that is shown on the button"
                    }
                ],
                needsUrls: [],
                constr(
                    state: SpecialVisualizationState,
                    _: UIEventSource<Record<string, string>>,
                    argument: string[]
                ): SvelteUIElement {
                    const [text] = argument
                    return new SvelteUIElement(ImportReviewIdentity, { state, text })
                }
            },
            {
                funcName: "reviews",
                group: "reviews",

                example:
                    "`{reviews()}` for a vanilla review, `{reviews(name, play_forest)}` to review a play forest. If a name is known, the name will be used as identifier, otherwise 'play_forest' is used",
                docs: "A pragmatic combination of `create_review` and `list_reviews`",
                args: [
                    {
                        name: "subjectKey",
                        defaultValue: "name",
                        doc: "The key to use to determine the subject. If specified, the subject will be <b>tags[subjectKey]</b>"
                    },
                    {
                        name: "fallback",
                        doc: "The identifier to use, if <i>tags[subjectKey]</i> as specified above is not available. This is effectively a fallback value"
                    },
                    {
                        name: "question",
                        doc: "The question to ask in the review form. Optional"
                    }
                ],
                constr(
                    state: SpecialVisualizationState,
                    tagSource: UIEventSource<Record<string, string>>,
                    args: string[],
                    feature: Feature,
                    layer: LayerConfig
                ): BaseUIElement {
                    return new Combine([
                        createReview.constr(state, tagSource, args, feature, layer),

                        listReviews.constr(state, tagSource, args, feature, layer)
                    ])
                }
            }
        ]
    }
}
