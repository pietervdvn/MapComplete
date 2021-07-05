import {Review} from "../../Logic/Web/Review";
import Combine from "../Base/Combine";
import {FixedUiElement} from "../Base/FixedUiElement";
import Translations from "../i18n/Translations";
import {Utils} from "../../Utils";
import BaseUIElement from "../BaseUIElement";
import Img from "../Base/Img";

export default class SingleReview extends Combine {
    
    constructor(review: Review) {
        const d = review.date;
        super(
            [
                new Combine([
                    SingleReview.GenStars(review.rating)
                ]),
                new FixedUiElement(review.comment),
                new Combine([
                    new Combine([

                        new FixedUiElement(review.author).SetClass("font-bold"),
                        review.affiliated ? Translations.t.reviews.affiliated_reviewer_warning : "",
                    ]).SetStyle("margin-right: 0.5em"),
                    new FixedUiElement(`${d.getFullYear()}-${Utils.TwoDigits(d.getMonth() + 1)}-${Utils.TwoDigits(d.getDate())} ${Utils.TwoDigits(d.getHours())}:${Utils.TwoDigits(d.getMinutes())}`)
                        .SetClass("subtle-lighter")
                ]).SetClass("flex mb-4 justify-end")

            ]
        );
        this.SetClass("block p-2 m-4 rounded-xl subtle-background review-element");
        if (review.made_by_user.data) {
            this.SetClass("border-attention-catch")
        }
    }

    public static GenStars(rating: number): BaseUIElement {
        if (rating === undefined) {
            return Translations.t.reviews.no_rating;
        }
        if (rating < 10) {
            rating = 10;
        }
        const scoreTen = Math.round(rating / 10);
        return new Combine([
            ...Utils.TimesT(scoreTen / 2, _ => new Img('./assets/svg/star.svg').SetClass("'h-8 w-8 md:h-12")),
            scoreTen % 2 == 1 ? new Img('./assets/svg/star_half.svg').SetClass('h-8 w-8 md:h-12') : undefined
        ]).SetClass("flex w-max")
    }

}