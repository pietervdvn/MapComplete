import {UIElement} from "../UIElement";
import {Review} from "../../Logic/Web/Review";
import Combine from "../Base/Combine";
import {FixedUiElement} from "../Base/FixedUiElement";
import Translations from "../i18n/Translations";
import {Utils} from "../../Utils";
import ReviewElement from "./ReviewElement";

export default class SingleReview extends UIElement{
    private _review: Review;
    constructor(review: Review) {
        super(review.made_by_user);
        this._review = review;
      
    }
    public static GenStars(rating: number): UIElement {
        if (rating === undefined) {
            return Translations.t.reviews.no_rating;
        }
        if (rating < 10) {
            rating = 10;
        }
        const scoreTen = Math.round(rating / 10);
        return new Combine([
            "<img src='./assets/svg/star.svg' />".repeat(Math.floor(scoreTen / 2)),
            scoreTen % 2 == 1 ? "<img src='./assets/svg/star_half.svg' />" : ""
        ])
    }
    InnerRender(): string {
        const d = this._review.date;
        let review = this._review;
        const el=  new Combine(
            [
                new Combine([
                  SingleReview.GenStars(review.rating)
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
        );
        el.SetClass("review-element");
        if(review.made_by_user){
            el.SetClass("review-by-current-user")
        }
        return el.Render();
    }
    
}