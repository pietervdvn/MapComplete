import {UIElement} from "../UIElement";
import {UIEventSource} from "../../Logic/UIEventSource";
import {LicenseInfo} from "../../Logic/Web/Wikimedia";
import {Mapillary} from "../../Logic/Web/Mapillary";
import Svg from "../../Svg";
import {SimpleImageElement} from "./SimpleImageElement";
import Combine from "../Base/Combine";
import Attribution from "./Attribution";


export class MapillaryImage extends UIElement {

    /***
     * Dictionary from url to already known license info
     */
    private static allLicenseInfos: any = {};
    private readonly _imageMeta: UIEventSource<LicenseInfo>;
    private readonly _imageLocation: string;

    constructor(source: string) {
        super()

        if (source.toLowerCase().startsWith("https://www.mapillary.com/map/im/")) {
            source = source.substring("https://www.mapillary.com/map/im/".length);
        }

        this._imageLocation = source;
        if (MapillaryImage.allLicenseInfos[source] !== undefined) {
            this._imageMeta = MapillaryImage.allLicenseInfos[source];
        } else {
            this._imageMeta = new UIEventSource<LicenseInfo>(null);
            MapillaryImage.allLicenseInfos[source] = this._imageMeta;
            const self = this;
            Mapillary.getDescriptionOfImage(source, (license) => {
                self._imageMeta.setData(license)
            })
        }

        this.ListenTo(this._imageMeta);

    }

    InnerRender(): string {
        const url = `https://images.mapillary.com/${this._imageLocation}/thumb-640.jpg?client_id=TXhLaWthQ1d4RUg0czVxaTVoRjFJZzowNDczNjUzNmIyNTQyYzI2`;
        const image = new SimpleImageElement(new UIEventSource<string>(url))
        
        const meta = this._imageMeta?.data;
        if (!meta) {
            return image.Render();
        }

        return new Combine([
            image,
            new Attribution(meta.artist, meta.license, Svg.mapillary_svg())
        ]).SetClass("relative block").Render();

    }


}