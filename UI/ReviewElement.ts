import {UIElement} from "./UIElement";
import {UIEventSource} from "../Logic/UIEventSource";
import Translations from "./i18n/Translations";
import Combine from "./Base/Combine";
import {FixedUiElement} from "./Base/FixedUiElement";
import {Utils} from "../Utils";

/**
 * Shows the reviews and scoring base on mangrove.reviesw
 */
export default class ReviewElement extends UIElement {
    private _reviews: UIEventSource<{ comment?: string; author: string; date: Date; rating: number }[]>;

    constructor(reviews: UIEventSource<{
        comment?: string,
        author: string,
        date: Date,
        rating: number
    }[]>) {
        super(reviews);
        this._reviews = reviews;
    }

    InnerRender(): string {

        const elements = [];

        elements.push(Translations.t.reviews.title.SetClass("review-title"));

        elements.push(...this._reviews.data.map(review => {
            const stars = Math.round(review.rating / 10)
            const fullStars = Math.floor(stars / 2);
            const d = review.date;

            return new Combine(
                [
                    new Combine([

                        new Combine([
                            "<img src='./assets/svg/star.svg' />".repeat(fullStars),
                            stars % 2 == 1 ? "<img src='./assets/svg/star_half.svg' />" : ""
                        ]).SetClass("review-rating"),
                        new FixedUiElement(`${d.getFullYear()}-${Utils.TwoDigits(d.getMonth() + 1)}-${Utils.TwoDigits(d.getDate())} ${Utils.TwoDigits(d.getHours())}:${Utils.TwoDigits(d.getMinutes())}`)
                            .SetClass("review-date"),
                    ]).SetClass("review-stars-date"),

                    new FixedUiElement(review.comment).SetClass("review-comment"),
                    "<br/>",
                    new FixedUiElement(review.author).SetClass("review-author"),

                ]
            ).SetClass("review-element")
        }));
        elements.push(
            new Combine([
                Translations.t.reviews.attribution,
                "<img src='./assets/mangrove_logo.png'>"
            ])

                .SetClass("review-attribution"))

        return new Combine(elements).SetClass("review").Render();
    }

}