/**
 * Shows the reviews and scoring base on mangrove.reviesw
 */
import {UIEventSource} from "../../Logic/UIEventSource";
import {Review} from "../../Logic/Web/Review";
import {UIElement} from "../UIElement";
import {Utils} from "../../Utils";
import Combine from "../Base/Combine";
import {FixedUiElement} from "../Base/FixedUiElement";
import Translations from "../i18n/Translations";

export default class ReviewElement extends UIElement {
    private readonly _reviews: UIEventSource<Review[]>;
    private readonly _subject: string;
    private _middleElement: UIElement;

    constructor(subject: string, reviews: UIEventSource<Review[]>, middleElement: UIElement) {
        super(reviews);
        this._middleElement = middleElement;
        if(reviews === undefined){
            throw "No reviews UIEVentsource Given!"
        }
        this._reviews = reviews;
        this._subject = subject;
    }

    InnerRender(): string {

        function genStars(rating: number) {
            if(rating === undefined){
                return Translations.t.reviews.no_rating;
            }
            if(rating < 10){
                rating = 10;
            }
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
                `<a href='https://mangrove.reviews/search?sub=${this._subject}'>`,
                Translations.t.reviews.title
                    .Subs({count: "" + revs.length}),
                "</a>"
            ])

                .SetClass("review-title"));
        
        elements.push(this._middleElement);

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
                        new Combine([

                            new FixedUiElement(review.author).SetClass("review-author"),
                            review.affiliated ? Translations.t.reviews.affiliated_reviewer_warning : "",
                        ]).SetStyle("margin-right: 0.5em"),
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