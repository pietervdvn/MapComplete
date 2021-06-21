import {UIEventSource} from "../../Logic/UIEventSource";
import {Review} from "../../Logic/Web/Review";
import Combine from "../Base/Combine";
import Translations from "../i18n/Translations";
import SingleReview from "./SingleReview";
import BaseUIElement from "../BaseUIElement";
import Img from "../Base/Img";
import {VariableUiElement} from "../Base/VariableUIElement";
import Link from "../Base/Link";

/**
 * Shows the reviews and scoring base on mangrove.reviews
 * The middle element is some other component shown in the middle, e.g. the review input element
 */
export default class ReviewElement extends VariableUiElement {

    constructor(subject: string, reviews: UIEventSource<Review[]>, middleElement: BaseUIElement) {
        super(
            reviews.map(revs => {
                const elements = [];
                revs.sort((a, b) => (b.date.getTime() - a.date.getTime())); // Sort with most recent first
                const avg = (revs.map(review => review.rating).reduce((a, b) => a + b, 0) / revs.length);
                elements.push(
                    new Combine([
                        SingleReview.GenStars(avg),
                        new Link(
                            revs.length === 1 ? Translations.t.reviews.title_singular.Clone() :
                                Translations.t.reviews.title.Clone()
                                    .Subs({count: "" + revs.length}),
                            `https://mangrove.reviews/search?sub=${encodeURIComponent(subject)}`,
                            true
                        ),
                    ])

                        .SetClass("font-2xl flex justify-between items-center pl-2 pr-2"));

                elements.push(middleElement);

                elements.push(...revs.map(review => new SingleReview(review)));
                elements.push(
                    new Combine([
                        Translations.t.reviews.attribution.Clone(),
                        new Img('./assets/mangrove_logo.png')
                    ])

                        .SetClass("review-attribution"))

                return new Combine(elements).SetClass("block");
            })
        );

    }

}