import {UIElement} from "../UIElement";
import {LicenseInfo, Wikimedia} from "../../Logic/Web/Wikimedia";
import {UIEventSource} from "../../Logic/UIEventSource";
import Svg from "../../Svg";
import Link from "../Base/Link";
import {FixedUiElement} from "../Base/FixedUiElement";
import Combine from "../Base/Combine";


export class WikimediaImage extends UIElement {


    static allLicenseInfos: any = {};
    private readonly _imageMeta: UIEventSource<LicenseInfo>;
    private readonly _imageLocation: string;

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

        const wikimediaLink = new Link(Svg.wikimedia_commons_white_img,
            `https://commons.wikimedia.org/wiki/${this._imageLocation}`, true)
            .SetStyle("width:2em;height: 2em");

        const attribution = new FixedUiElement(this._imageMeta.data.artist ?? "").SetClass("attribution-author");
        const license = new FixedUiElement(this._imageMeta.data.licenseShortName ?? "").SetClass("license");
        const image = "<img src='" + url + "' " + "alt='" + this._imageMeta.data.description + "' >";

        return "<div class='imgWithAttr'>" +
            image +
            new Combine([wikimediaLink, attribution]).SetClass("attribution").Render() +
            "</div>";
    }


}