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
import UserDetails, {OsmConnection} from "../../Logic/Osm/OsmConnection";
import BaseUIElement from "../BaseUIElement";
import Toggle from "../Input/Toggle";

export default class ReviewForm extends InputElement<Review> {

    IsSelected: UIEventSource<boolean> = new UIEventSource<boolean>(false);
    private readonly _value: UIEventSource<Review>;
    private readonly _comment: BaseUIElement;
    private readonly _stars: BaseUIElement;
    private _saveButton: BaseUIElement;
    private readonly _isAffiliated: BaseUIElement;
    private readonly _postingAs: BaseUIElement;
    private readonly _osmConnection: OsmConnection;

    constructor(onSave: ((r: Review, doneSaving: (() => void)) => void), osmConnection: OsmConnection) {
        super();
        this._osmConnection = osmConnection;
        this._value = new UIEventSource({
            made_by_user: new UIEventSource<boolean>(true),
            rating: undefined,
            comment: undefined,
            author: osmConnection.userDetails.data.name,
            affiliated: false,
            date: new Date()
        });
        const comment = new TextField({
            placeholder: Translations.t.reviews.write_a_comment.Clone(),
            htmlType: "area",
            value: this._value.map(r => r?.comment),
            textAreaRows: 5
        })
        comment.GetValue().addCallback(comment => {
            self._value.data.comment = comment;
            self._value.ping();
        })
        const self = this;

        this._postingAs =
            new Combine([Translations.t.reviews.posting_as.Clone(),
                new VariableUiElement(osmConnection.userDetails.map((ud: UserDetails) => ud.name))
                    .SetClass("review-author")])
                .SetStyle("display:flex;flex-direction: column;align-items: flex-end;margin-left: auto;")


        const reviewIsSaved = new UIEventSource<boolean>(false)
        const reviewIsSaving = new UIEventSource<boolean>(false)
        this._saveButton =
            new Toggle(Translations.t.reviews.saved.Clone().SetClass("thanks"),
                new Toggle(
                    Translations.t.reviews.saving_review.Clone(),
                    new SaveButton(
                        this._value.map(r => self.IsValid(r)), osmConnection
                    ).onClick(() => {
                        reviewIsSaving.setData(true),
                            onSave(this._value.data, () => {
                                reviewIsSaved.setData(true)
                            });
                    }),
                    reviewIsSaving
                ),
                reviewIsSaved
            ).SetClass("break-normal")


        this._isAffiliated = new CheckBoxes([Translations.t.reviews.i_am_affiliated.Clone()])

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

    InnerConstructElement(): HTMLElement {

        const form = new Combine([
            new Combine([this._stars, this._postingAs]).SetClass("flex"),
            this._comment,
            new Combine([
                this._isAffiliated,
                this._saveButton
            ]).SetClass("review-form-bottom"),
            Translations.t.reviews.tos.Clone().SetClass("subtle")
        ])
            .SetClass("flex flex-col p-4")
            .SetStyle("border-radius: 1em;" +
                "    background-color: var(--subtle-detail-color);" +
                "    color: var(--subtle-detail-color-contrast);" +
                "    border: 2px solid var(--subtle-detail-color-contrast)")

        const connection = this._osmConnection;
        const login = Translations.t.reviews.plz_login.Clone().onClick(() => connection.AttemptLogin())

        return new Toggle(form, login,
            connection.isLoggedIn)
            .ConstructElement()
    }

    IsValid(r: Review): boolean {
        if (r === undefined) {
            return false;
        }
        return (r.comment?.length ?? 0) <= 1000 && (r.author?.length ?? 0) <= 20 && r.rating >= 0 && r.rating <= 100;
    }


}