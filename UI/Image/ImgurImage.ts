import {UIElement} from "../UIElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import {LicenseInfo} from "../../Logic/Web/Wikimedia";
import {Imgur} from "../../Logic/Web/Imgur";
import Combine from "../Base/Combine";
import Attribution from "./Attribution";
import BaseUIElement from "../BaseUIElement";
import Img from "../Base/Img";
import {VariableUiElement} from "../Base/VariableUIElement";


export class ImgurImage extends UIElement {


    /***
     * Dictionary from url to alreayd known license info
     */
    private static allLicenseInfos: any = {};
    private readonly _imageMeta: UIEventSource<LicenseInfo>;
    private readonly _imageLocation: string;

    constructor(source: string) {
        super()
        this._imageLocation = source;
        if (ImgurImage.allLicenseInfos[source] !== undefined) {
            this._imageMeta = ImgurImage.allLicenseInfos[source];
        } else {
            this._imageMeta = new UIEventSource<LicenseInfo>(null);
            ImgurImage.allLicenseInfos[source] = this._imageMeta;
            const self = this;
            Imgur.getDescriptionOfImage(source, (license) => {
                self._imageMeta.setData(license)
            })
        }
    }

    InnerRender(): BaseUIElement {
        const image = new Img( this._imageLocation);
        
        return new Combine([
            image,
           new VariableUiElement(this._imageMeta.map(meta => (meta === undefined || meta === null) ? undefined : new Attribution(meta.artist, meta.license, undefined)))
        ]).SetClass('block relative h-full');

    }


}