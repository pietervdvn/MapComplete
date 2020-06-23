import {UIEventSource} from "../UIEventSource";
import {UIElement} from "../UIElement";
import {SimpleImageElement} from "./SimpleImageElement";
import {LicenseInfo, Wikimedia} from "../../Logic/Wikimedia";


export class WikimediaImage extends UIElement {

    private _imageMeta: UIEventSource<LicenseInfo>;


    constructor(source: UIEventSource<string>) {
        super(source)
        const meta = new UIEventSource<LicenseInfo>(new LicenseInfo());
        this.ListenTo(meta);
        this._imageMeta = meta;
        this._source.addCallback(() => {
            Wikimedia.LicenseData(source.data, (info) => {
                meta.setData(info);
            })
        });
        this._source.ping();
    }

    protected InnerRender(): string {
        let url = Wikimedia.ImageNameToUrl(this._source.data);
        url = url.replace(/'/g, '%27');
        return "<div class='imgWithAttr'><img class='attributedImage' src='" + url + "' " +
            "alt='" + this._imageMeta.data.description + "' >" +
            "<br /><span class='attribution'>" +
            "<a href='https://commons.wikimedia.org/wiki/"+this._source.data+"' target='_blank'><b>" + (this._source.data) + "</b></a> <br />" +
            (this._imageMeta.data.artist ?? "Unknown artist") + " " + (this._imageMeta.data.licenseShortName ?? "") +
            "</span>" +
            "</div>";
    }


}