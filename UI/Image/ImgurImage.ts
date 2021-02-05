import {UIElement} from "../UIElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import {LicenseInfo} from "../../Logic/Web/Wikimedia";
import {Imgur} from "../../Logic/Web/Imgur";
import Combine from "../Base/Combine";
import Attribution from "./Attribution";
import {SimpleImageElement} from "./SimpleImageElement";


export class ImgurImage extends UIElement {


    /***
     * Dictionary from url to alreayd known license info
     */
    private static allLicenseInfos: any = {};
    private readonly _imageMeta: UIEventSource<LicenseInfo>;
    private readonly _imageLocation: string;

    constructor(source: string) {
        super(undefined)
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
        
        this.ListenTo(this._imageMeta);
      
    }

    InnerRender(): string {
        const image = new SimpleImageElement( new UIEventSource (this._imageLocation));
        
        if(this._imageMeta.data === null){
            return image.Render();
        }
        
        const meta = this._imageMeta.data;
        return new Combine([
            image,
            new Attribution(meta.artist, meta.license, undefined),
            
        ]).SetClass('block relative')
            .Render();

    }


}