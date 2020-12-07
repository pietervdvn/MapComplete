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

        function genStars(rating: number) {
            const scoreTen = Math.round(rating / 10);
            return new Combine([
                "<img src='./assets/svg/star.svg' />".repeat(Math.floor(scoreTen / 2)),
                scoreTen % 2 == 1 ? "<img src='./assets/svg/star_half.svg' />" : ""
            ])
        }

        const elements = [];
        const revs = this._reviews.data;
        revs.sort((a,b) => (b.date.getTime() - a.date.getTime())); // Sort with most recent first
        const avg = (revs.map(review => review.rating).reduce((a, b) => a + b, 0) / revs.length);
        elements.push(
            new Combine([
                genStars(avg).SetClass("stars"),
                Translations.t.reviews.title
                    .Subs({count: "" + revs.length})
            ])

                .SetClass("review-title"));

        elements.push(...revs.map(review => {
            const d = review.date;
            return new Combine(
                [
                    new Combine([
                        genStars(review.rating)
                            .SetClass("review-rating"),
                        new FixedUiElement(review.comment).SetClass("review-comment")
                    ]).SetClass("review-stars-comment"),

                    new Combine([

                        new FixedUiElement(review.author).SetClass("review-author"),
                        new FixedUiElement(`${d.getFullYear()}-${Utils.TwoDigits(d.getMonth() + 1)}-${Utils.TwoDigits(d.getDate())} ${Utils.TwoDigits(d.getHours())}:${Utils.TwoDigits(d.getMinutes())}`)
                            .SetClass("review-date")
                    ]).SetClass("review-author-date")

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