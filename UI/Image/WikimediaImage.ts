import {UIEventSource} from "../UIEventSource";
import {UIElement} from "../UIElement";
import {LicenseInfo, Wikimedia} from "../../Logic/Wikimedia";


export class WikimediaImage extends UIElement {


    static allLicenseInfos: any = {};
    private _imageMeta: UIEventSource<LicenseInfo>;
    private _imageLocation : string;

    constructor(source: string) {
        super(undefined)
        this._imageLocation = source;
        if (WikimediaImage.allLicenseInfos[source] !== undefined) {
            this._imageMeta = WikimediaImage.allLicenseInfos[source];
        } else {
            this._imageMeta = new UIEventSource<LicenseInfo>(new LicenseInfo());
            WikimediaImage.allLicenseInfos[source] = this._imageMeta;
            const self = this;
            Wikimedia.LicenseData(source, (info) => {
                self._imageMeta.setData(info);
            })
        }

        this.ListenTo(this._imageMeta);

      
    }

    InnerRender(): string {
        let url = Wikimedia.ImageNameToUrl(this._imageLocation, 500, 400);
        url = url.replace(/'/g, '%27');

        const wikimediaLink =
            "<a href='https://commons.wikimedia.org/wiki/" + this._imageLocation + "' target='_blank'>" +
            "<img class='wikimedia-link' src='./assets/wikimedia-commons-white.svg' alt='Wikimedia Commons Logo'/>" +
            "</a> ";

        const attribution =
            "<span class='attribution-author'>" + (this._imageMeta.data.artist ?? "") + "</span>" + " <span class='license'>" + (this._imageMeta.data.licenseShortName ?? "") + "</span>";
        const image = "<img src='" + url + "' " + "alt='" + this._imageMeta.data.description + "' >";

        return "<div class='imgWithAttr'>" +
            image +
            "<div class='attribution'>" +
            wikimediaLink +
            attribution +
            "</div>" +
            "</div>";
    }


}