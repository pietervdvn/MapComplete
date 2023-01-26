import { Review } from "mangrove-reviews-typescript"
import { Store, UIEventSource } from "../../Logic/UIEventSource"
import { TextField } from "../Input/TextField"
import Translations from "../i18n/Translations"
import Combine from "../Base/Combine"
import Svg from "../../Svg"
import { VariableUiElement } from "../Base/VariableUIElement"
import { CheckBox } from "../Input/Checkboxes"
import UserDetails, { OsmConnection } from "../../Logic/Osm/OsmConnection"
import Toggle from "../Input/Toggle"
import { LoginToggle } from "../Popup/LoginButton"
import { SubtleButton } from "../Base/SubtleButton"

export default class ReviewForm extends LoginToggle {
    constructor(
        onSave: (r: Omit<Review, "sub">) => Promise<void>,
        state: {
            readonly osmConnection: OsmConnection
            readonly featureSwitchUserbadge: Store<boolean>
        }
    ) {
        /*  made_by_user: new UIEventSource<boolean>(true),
            rating: undefined,
            comment: undefined,
            author: osmConnection.userDetails.data.name,
            affiliated: false,
            date: new Date(),*/
        const commentForm = new TextField({
            placeholder: Translations.t.reviews.write_a_comment.Clone(),
            htmlType: "area",
            textAreaRows: 5,
        })

        const rating = new UIEventSource<number>(undefined)
        const isAffiliated = new CheckBox(Translations.t.reviews.i_am_affiliated)
        const reviewMade = new UIEventSource(false)

        const postingAs = new Combine([
            Translations.t.reviews.posting_as.Clone(),
            new VariableUiElement(
                state.osmConnection.userDetails.map((ud: UserDetails) => ud.name)
            ).SetClass("review-author"),
        ]).SetStyle("display:flex;flex-direction: column;align-items: flex-end;margin-left: auto;")

        const saveButton = new Toggle(
            Translations.t.reviews.no_rating.SetClass("block alert"),
            new SubtleButton(Svg.confirm_svg(), Translations.t.reviews.save, {
                extraClasses: "border-attention-catch",
            })
                .OnClickWithLoading(
                    Translations.t.reviews.saving_review.SetClass("alert"),
                    async () => {
                        const review: Omit<Review, "sub"> = {
                            rating: rating.data,
                            opinion: commentForm.GetValue().data,
                            metadata: { nickname: state.osmConnection.userDetails.data.name },
                        }
                        await onSave(review)
                    }
                )
                .SetClass("break-normal"),
            rating.map((r) => r === undefined, [commentForm.GetValue()])
        )

        const stars = []
        for (let i = 1; i <= 5; i++) {
            stars.push(
                new VariableUiElement(
                    rating.map((score) => {
                        if (score === undefined) {
                            return Svg.star_outline.replace(/#000000/g, "#ccc")
                        }
                        return score < i * 20 ? Svg.star_outline : Svg.star
                    })
                ).onClick(() => {
                    rating.setData(i * 20)
                })
            )
        }

        const form = new Combine([
            new Combine([new Combine(stars).SetClass("review-form-rating"), postingAs]).SetClass(
                "flex"
            ),
            commentForm,
            new Combine([isAffiliated, saveButton]),
            Translations.t.reviews.tos.Clone().SetClass("subtle"),
        ])
            .SetClass("flex flex-col p-4")
            .SetStyle(
                "border-radius: 1em;" +
                    "    background-color: var(--subtle-detail-color);" +
                    "    color: var(--subtle-detail-color-contrast);" +
                    "    border: 2px solid var(--subtle-detail-color-contrast)"
            )

        super(
            new Toggle(Translations.t.reviews.saved.Clone().SetClass("thanks"), form, reviewMade),
            Translations.t.reviews.plz_login,
            state
        )
    }
}
