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
            "<img src='./assets/svg/star.svg' class='h-8 md:h-12'/>".repeat(Math.floor(scoreTen / 2)),
            scoreTen % 2 == 1 ? "<img src='./assets/svg/star_half.svg' class='h-8 md:h-12'/>" : ""
        ]).SetClass("flex w-max")
    }
    InnerRender(): string {
        const d = this._review.date;
        let review = this._review;
        const el=  new Combine(
            [
                new Combine([
                  SingleReview.GenStars(review.rating)                    
                ]),
                new FixedUiElement(review.comment),
                new Combine([
                    new Combine([

                        new Combine(["<b>",review.author,"</b>"]),
                        review.affiliated ? Translations.t.reviews.affiliated_reviewer_warning : "",
                    ]).SetStyle("margin-right: 0.5em"),
                    new FixedUiElement(`${d.getFullYear()}-${Utils.TwoDigits(d.getMonth() + 1)}-${Utils.TwoDigits(d.getDate())} ${Utils.TwoDigits(d.getHours())}:${Utils.TwoDigits(d.getMinutes())}`)
                        .SetClass("subtle-lighter")
                ]).SetClass("flex mb-4 justify-end")

            ]
        );
        el.SetClass("block p-2 m-1 rounded-xl subtle-background review-element");
        if(review.made_by_user.data){
            el.SetClass("border-attention-catch")
        }
        return el.Render();
    }
    
}