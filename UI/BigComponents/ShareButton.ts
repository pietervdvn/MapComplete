import BaseUIElement from "../BaseUIElement";

export default class ShareButton extends BaseUIElement{
    private _embedded: BaseUIElement;
    private _shareData: () => { text: string; title: string; url: string };
    
    constructor(embedded: BaseUIElement, generateShareData: () => {
        text: string,
        title: string,
        url: string
    }) {
        super();
        this._embedded = embedded;
        this._shareData = generateShareData;
        this.SetClass("share-button")
    }

    protected InnerConstructElement(): HTMLElement {
        const e = document.createElement("button")
        e.type = "button"
        e.appendChild(this._embedded.ConstructElement())
        
        e.addEventListener('click', () => {
            if (navigator.share) {
                navigator.share(this._shareData()).then(() => {
                    console.log('Thanks for sharing!');
                })
                    .catch(err => {
                        console.log(`Couldn't share because of`, err.message);
                    });
            } else {
                console.log('web share not supported');
            }
        });
        
        return e;
    }


}