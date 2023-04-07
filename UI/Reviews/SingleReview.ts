import Combine from "../Base/Combine"
import { FixedUiElement } from "../Base/FixedUiElement"
import Translations from "../i18n/Translations"
import { Utils } from "../../Utils"
import BaseUIElement from "../BaseUIElement"
import Img from "../Base/Img"
import { Review } from "mangrove-reviews-typescript"
import { Store } from "../../Logic/UIEventSource"

export default class SingleReview extends Combine {
    constructor(review: Review & { madeByLoggedInUser: Store<boolean> }) {
        const date = new Date(review.iat * 1000)
        const reviewAuthor =
            review.metadata.nickname ??
            (review.metadata.given_name ?? "") + (review.metadata.family_name ?? "")
        super([
            new Combine([SingleReview.GenStars(review.rating)]),
            new FixedUiElement(review.opinion),
            new Combine([
                new Combine([
                    new FixedUiElement(reviewAuthor).SetClass("font-bold"),
                    review.metadata.is_affiliated
                        ? Translations.t.reviews.affiliated_reviewer_warning
                        : "",
                ]).SetStyle("margin-right: 0.5em"),
                new FixedUiElement(
                    `${date.getFullYear()}-${Utils.TwoDigits(
                        date.getMonth() + 1
                    )}-${Utils.TwoDigits(date.getDate())} ${Utils.TwoDigits(
                        date.getHours()
                    )}:${Utils.TwoDigits(date.getMinutes())}`
                ).SetClass("subtle-lighter"),
            ]).SetClass("flex mb-4 justify-end"),
        ])
        this.SetClass("block p-2 m-4 rounded-xl subtle-background review-element")
        review.madeByLoggedInUser.addCallbackAndRun((madeByUser) => {
            if (madeByUser) {
                this.SetClass("border-attention-catch")
            } else {
                this.RemoveClass("border-attention-catch")
            }
        })
    }

    public static GenStars(rating: number): BaseUIElement {
        if (rating === undefined) {
            return Translations.t.reviews.no_rating
        }
        if (rating < 10) {
            rating = 10
        }
        const scoreTen = Math.round(rating / 10)
        return new Combine([
            ...Utils.TimesT(scoreTen / 2, (_) =>
                new Img("./assets/svg/star.svg").SetClass("'h-8 w-8 md:h-12")
            ),
            scoreTen % 2 == 1
                ? new Img("./assets/svg/star_half.svg").SetClass("h-8 w-8 md:h-12")
                : undefined,
        ]).SetClass("flex w-max")
    }
}
