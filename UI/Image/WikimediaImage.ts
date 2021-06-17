import {UIElement} from "../UIElement";
import {LicenseInfo, Wikimedia} from "../../Logic/Web/Wikimedia";
import {UIEventSource} from "../../Logic/UIEventSource";
import Svg from "../../Svg";
import Link from "../Base/Link";
import Combine from "../Base/Combine";
import Attribution from "./Attribution";
import BaseUIElement from "../BaseUIElement";
import Img from "../Base/Img";


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

    InnerRender(): BaseUIElement {
        const url = Wikimedia.ImageNameToUrl(this._imageLocation, 500, 400)
            .replace(/'/g, '%27');
        const image = new Img(url)
        const meta = this._imageMeta?.data;

        if (!meta) {
            return image;
        }
        new Link(Svg.wikimedia_commons_white_img,
            `https://commons.wikimedia.org/wiki/${this._imageLocation}`, true)
            .SetStyle("width:2em;height: 2em");
        
        return new Combine([
            image,
            new Attribution(meta.artist, meta.license, Svg.wikimedia_commons_white_svg())
        ]).SetClass("relative block h-full")

    }


}