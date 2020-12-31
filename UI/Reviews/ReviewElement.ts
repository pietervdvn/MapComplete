/**
 * Shows the reviews and scoring base on mangrove.reviesw
 */
import {UIEventSource} from "../../Logic/UIEventSource";
import {Review} from "../../Logic/Web/Review";
import {UIElement} from "../UIElement";
import Combine from "../Base/Combine";
import Translations from "../i18n/Translations";
import SingleReview from "./SingleReview";

export default class ReviewElement extends UIElement {
    private readonly _reviews: UIEventSource<Review[]>;
    private readonly _subject: string;
    private _middleElement: UIElement;

    constructor(subject: string, reviews: UIEventSource<Review[]>, middleElement: UIElement) {
        super(reviews);
        this._middleElement = middleElement;
        if (reviews === undefined) {
            throw "No reviews UIEVentsource Given!"
        }
        this._reviews = reviews;
        this._subject = subject;
    }

   

    InnerRender(): string {

        const elements = [];
        const revs = this._reviews.data;
        revs.sort((a, b) => (b.date.getTime() - a.date.getTime())); // Sort with most recent first
        const avg = (revs.map(review => review.rating).reduce((a, b) => a + b, 0) / revs.length);
        elements.push(
            new Combine([
                SingleReview.GenStars(avg).SetClass("stars"),
                `<a target="_blank" href='https://mangrove.reviews/search?sub=${encodeURIComponent(this._subject)}'>`,
               revs.length === 1 ? Translations.t.reviews.title_singular :
                   Translations.t.reviews.title
                      .Subs({count: "" + revs.length})
                ,
                "</a>"
            ])

                .SetClass("review-title"));
        
        elements.push(this._middleElement);

        elements.push(...revs.map(review => new SingleReview(review)));
        elements.push(
            new Combine([
                Translations.t.reviews.attribution,
                "<img src='./assets/mangrove_logo.png'>"
            ])

                .SetClass("review-attribution"))

        return new Combine(elements).SetClass("review").Render();
    }

}