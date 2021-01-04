import {UIElement} from "../UIElement";

export default class ShareButton extends UIElement{
    private _embedded: UIElement;
    private _shareData: { text: string; title: string; url: string };
    
    constructor(embedded: UIElement, shareData: {
        text: string,
        title: string,
        url: string
    }) {
        super();
        this._embedded = embedded;
        this._shareData = shareData;
    }
    
    InnerRender(): string {
        return `<button type="button" class="share-button" id="${this.id}">${this._embedded.Render()}</button>`
    }

    protected InnerUpdate(htmlElement: HTMLElement) {
        super.InnerUpdate(htmlElement);
        const self= this;
        htmlElement.addEventListener('click', () => {
            if (navigator.share) {
                navigator.share(self._shareData).then(() => {
                    console.log('Thanks for sharing!');
                })
                    .catch(err => {
                        console.log(`Couldn't share because of`, err.message);
                    });
            } else {
                console.log('web share not supported');
            }
        });
    }

}