import {UIElement} from "../UIElement";
import {InputElement} from "../Input/InputElement";
import {Review} from "../../Logic/Web/Review";
import {UIEventSource} from "../../Logic/UIEventSource";
import {TextField} from "../Input/TextField";
import Translations from "../i18n/Translations";
import Combine from "../Base/Combine";
import Svg from "../../Svg";
import {VariableUiElement} from "../Base/VariableUIElement";
import {SaveButton} from "../Popup/SaveButton";
import CheckBoxes from "../Input/Checkboxes";
import UserDetails from "../../Logic/Osm/OsmConnection";

export default class ReviewForm extends InputElement<Review> {

    private readonly _value: UIEventSource<Review>;
    private readonly _comment: UIElement;
    private readonly _stars: UIElement;
    private _saveButton: UIElement;
    private readonly _isAffiliated: UIElement;
    private userDetails: UIEventSource<UserDetails>;
    private readonly _postingAs: UIElement;


    constructor(onSave: ((r: Review, doneSaving: (() => void)) => void), userDetails: UIEventSource<UserDetails>) {
        super();
        this.userDetails = userDetails;
        const t = Translations.t.reviews;
        this._value  = new UIEventSource({
            made_by_user: new UIEventSource<boolean>(true),
            rating: undefined,
            comment: undefined,
            author: userDetails.data.name,
            affiliated: false,
            date: new Date()
        });
        const comment = new TextField({
            placeholder: Translations.t.reviews.write_a_comment,
            textArea: true,
            value: this._value.map(r => r?.comment),
            textAreaRows: 5
        })
        comment.GetValue().addCallback(comment => {
            self._value.data.comment = comment;
            self._value.ping();
        })
        const self = this;

        this._postingAs =
            new Combine([t.posting_as, new VariableUiElement(userDetails.map((ud: UserDetails) => ud.name)).SetClass("review-author")])
                .SetStyle("display:flex;flex-direction: column;align-items: flex-end;margin-left: auto;")
        this._saveButton =
            new SaveButton(this._value.map(r => self.IsValid(r)), undefined)
                .onClick(() => {
                    self._saveButton = Translations.t.reviews.saving_review;
                    onSave(this._value.data, () => {
                        self._saveButton = Translations.t.reviews.saved.SetClass("thanks");
                    });
                }).SetClass("break-normal")

        this._isAffiliated = new CheckBoxes([t.i_am_affiliated])

        this._comment = comment;
        const stars = []
        for (let i = 1; i <= 5; i++) {
            stars.push(
                new VariableUiElement(this._value.map(review => {
                        if (review.rating === undefined) {
                            return Svg.star_outline.replace(/#000000/g, "#ccc");
                        }
                        return review.rating < i * 20 ?
                            Svg.star_outline :
                            Svg.star
                    }
                ))
                    .onClick(() => {
                        self._value.data.rating = i * 20;
                        self._value.ping();
                    })
            )
        }
        this._stars = new Combine(stars).SetClass("review-form-rating")
    }

    GetValue(): UIEventSource<Review> {
        return this._value;
    }

    InnerRender(): string {

        if(!this.userDetails.data.loggedIn){
            return Translations.t.reviews.plz_login.Render();
        }

        return new Combine([
            new Combine([this._stars, this._postingAs]).SetClass("review-form-top"),
            this._comment,
            new Combine([
                this._isAffiliated,
                this._saveButton
            ]).SetClass("review-form-bottom"),
            "<br/>",
            Translations.t.reviews.tos.SetClass("subtle")
        ])
            .SetClass("review-form")
            .Render();
    }

    IsSelected: UIEventSource<boolean> = new UIEventSource<boolean>(false);

    IsValid(r: Review): boolean {
        if (r === undefined) {
            return false;
        }
        return (r.comment?.length ?? 0) <= 1000 && (r.author?.length ?? 0) <= 20 && r.rating >= 0 && r.rating <= 100;
    }


}