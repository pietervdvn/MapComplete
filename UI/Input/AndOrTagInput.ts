import {InputElement} from "./InputElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import {UIElement} from "../UIElement";
import Combine from "../Base/Combine";
import {SubtleButton} from "../Base/SubtleButton";
import CheckBox from "./CheckBox";
import {AndOrTagConfigJson} from "../../Customizations/JSON/TagConfigJson";
import {MultiTagInput} from "./MultiTagInput";
import Svg from "../../Svg";

class AndOrConfig implements AndOrTagConfigJson {
    public and: (string | AndOrTagConfigJson)[] = undefined;
    public or: (string | AndOrTagConfigJson)[] = undefined;
}


export default class AndOrTagInput extends InputElement<AndOrTagConfigJson> {

    private readonly _rawTags = new MultiTagInput();
    private readonly _subAndOrs: AndOrTagInput[] = [];
    private readonly _isAnd: UIEventSource<boolean> = new UIEventSource<boolean>(true);
    private readonly _isAndButton;
    private readonly _addBlock: UIElement;
    private readonly _value: UIEventSource<AndOrConfig> = new UIEventSource<AndOrConfig>(undefined);

    public bottomLeftButton: UIElement;

    IsSelected: UIEventSource<boolean>;

    constructor() {
        super();
        const self = this;
        this._isAndButton = new CheckBox(
            new SubtleButton(Svg.ampersand_ui(), null).SetClass("small-button"),
            new SubtleButton(Svg.or_ui(), null).SetClass("small-button"),
            this._isAnd);


        this._addBlock =
            new SubtleButton(Svg.addSmall_ui(), "Add an and/or-expression")
                .SetClass("small-button")
                .onClick(() => {self.createNewBlock()});


        this._isAnd.addCallback(() => self.UpdateValue());
        this._rawTags.GetValue().addCallback(() => {
            self.UpdateValue()
        });

        this.IsSelected = this._rawTags.IsSelected;

        this._value.addCallback(tags => self.loadFromValue(tags));

    }
    
    private createNewBlock(){
        const inputEl = new AndOrTagInput();
        inputEl.GetValue().addCallback(() => this.UpdateValue());
        const deleteButton = this.createDeleteButton(inputEl.id);
        inputEl.bottomLeftButton = deleteButton;
        this._subAndOrs.push(inputEl);
        this.Update();
    }

    private createDeleteButton(elementId: string): UIElement {
        const self = this;
        return new SubtleButton(Svg.delete_icon_ui(), null).SetClass("small-button")
            .onClick(() => {
                for (let i = 0; i < self._subAndOrs.length; i++) {
                    if (self._subAndOrs[i].id === elementId) {
                        self._subAndOrs.splice(i, 1);
                        self.Update();
                        self.UpdateValue();
                        return;
                    }
                }
            });

    }

    private loadFromValue(value: AndOrTagConfigJson) {
        this._isAnd.setData(value.and !== undefined);
        const tags = value.and ?? value.or;
        const rawTags: string[] = [];
        const subTags: AndOrTagConfigJson[] = [];
        for (const tag of tags) {

            if (typeof (tag) === "string") {
                rawTags.push(tag);
            } else {
                subTags.push(tag);
            }
        }

        for (let i = 0; i < rawTags.length; i++) {
            if (this._rawTags.GetValue().data[i] !== rawTags[i]) {
                // For some reason, 'setData' isn't stable as the comparison between the lists fails
                // Probably because we generate a new list object every timee
                // So we compare again here and update only if we find a difference
                this._rawTags.GetValue().setData(rawTags);
                break;
            }
        }
        
        while(this._subAndOrs.length < subTags.length){
            this.createNewBlock();
        }

        for (let i = 0; i < subTags.length; i++){
            let subTag = subTags[i];
            this._subAndOrs[i].GetValue().setData(subTag);
            
        }

    }

    private UpdateValue() {
        const tags: (string | AndOrTagConfigJson)[] = [];
        tags.push(...this._rawTags.GetValue().data);

        for (const subAndOr of this._subAndOrs) {
            const subAndOrData = subAndOr._value.data;
            if (subAndOrData === undefined) {
                continue;
            }
            console.log(subAndOrData);
            tags.push(subAndOrData);
        }

        const tagConfig = new AndOrConfig();

        if (this._isAnd.data) {
            tagConfig.and = tags;
        } else {
            tagConfig.or = tags;
        }
        this._value.setData(tagConfig);
    }

    GetValue(): UIEventSource<AndOrTagConfigJson> {
        return this._value;
    }

    InnerRender(): string {
        const leftColumn = new Combine([
            this._isAndButton,
            "<br/>",
            this.bottomLeftButton ?? ""
        ]);
        const tags = new Combine([
            this._rawTags,
            ...this._subAndOrs,
            this._addBlock
        ]).Render();
        return `<span class="bordered"><table><tr><td>${leftColumn.Render()}</td><td>${tags}</td></tr></table></span>`;
    }


    IsValid(t: AndOrTagConfigJson): boolean {
        return true;
    }


}