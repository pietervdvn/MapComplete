

import jsPDF from "jspdf";
import {SimpleMapScreenshoter} from "leaflet-simple-map-screenshoter";
import {UIEventSource} from "../Logic/UIEventSource";
import Minimap from "./Base/Minimap";
import Loc from "../Models/Loc";
import BaseLayer from "../Models/BaseLayer";
import {FixedUiElement} from "./Base/FixedUiElement";
import Translations from "./i18n/Translations";
import State from "../State";
import Constants from "../Models/Constants";
import LayoutConfig from "../Models/ThemeConfig/LayoutConfig";
import FeaturePipeline from "../Logic/FeatureSource/FeaturePipeline";
import ShowDataLayer from "./ShowDataLayer/ShowDataLayer";
import {BBox} from "../Logic/BBox";
/**
 * Creates screenshoter to take png screenshot
 * Creates jspdf and downloads it
 *        -    landscape pdf
 *
 * To add new layout:
 *        -    add new possible layout name in constructor
 *        -    add new layout in "PDFLayout"
 *                -> in there are more instructions
 */
export default class ExportPDF {
    // dimensions of the map in milimeter
    public isRunning = new UIEventSource(true)
    // A4: 297 * 210mm
    private readonly mapW = 297;
    private readonly mapH = 210;
    private readonly scaling = 2
    private readonly freeDivId: string;
    private readonly _layout: UIEventSource<LayoutConfig>;
    private _screenhotTaken = false;

    constructor(
        options: {
            freeDivId: string,
            location: UIEventSource<Loc>,
            background?: UIEventSource<BaseLayer>
            features: FeaturePipeline,
            layout: UIEventSource<LayoutConfig>
        }
    ) {

        this.freeDivId = options.freeDivId;
        this._layout = options.layout;
        const self = this;

        // We create a minimap at the given location and attach it to the given 'hidden' element

        const l = options.location.data;
        const loc = {
            lat: l.lat,
            lon: l.lon,
            zoom: l.zoom + 1
        }

        const minimap = Minimap.createMiniMap({
            location: new UIEventSource<Loc>(loc), // We remove the link between the old and the new UI-event source as moving the map while the export is running fucks up the screenshot
            background: options.background,
            allowMoving: false,


            onFullyLoaded: leaflet => window.setTimeout(() => {
                if (self._screenhotTaken) {
                    return;
                }
                try {
                    self.CreatePdf(leaflet)
                        .then(() => self.cleanup())
                        .catch(() => self.cleanup())
                } catch (e) {
                    console.error(e)
                    self.cleanup()
                }

            }, 500)
        })

        minimap.SetStyle(`width: ${this.mapW * this.scaling}mm; height: ${this.mapH * this.scaling}mm;`)
        minimap.AttachTo(options.freeDivId)

        // Next: we prepare the features. Only fully contained features are shown
        minimap.leafletMap .addCallbackAndRunD(leaflet => {
            const bounds = BBox.fromLeafletBounds(leaflet.getBounds().pad(0.2))
            options.features.GetTilesPerLayerWithin(bounds, tile => {
                console.log("REndering", tile.name)
                new ShowDataLayer(
                    {
                        features: tile,
                        leafletMap: minimap.leafletMap,
                        layerToShow: tile.layer.layerDef,
                        enablePopups: false
                    }
                )
            })
            
        })

    }

    private cleanup() {
        new FixedUiElement("Screenshot taken!").AttachTo(this.freeDivId)
        this._screenhotTaken = true;
    }

    private async CreatePdf(leaflet: L.Map) {
        const t = Translations.t.general.pdf;
        const layout = this._layout.data
        const screenshotter = new SimpleMapScreenshoter();
        //minimap op index.html -> hidden daar alles op doen en dan weg
        //minimap - leaflet map ophalen - boundaries ophalen - State.state.featurePipeline
        screenshotter.addTo(leaflet);
        console.log("Taking screenshot")


        let doc = new jsPDF('landscape');


        const image = (await screenshotter.takeScreen('image'))
        // @ts-ignore
        doc.addImage(image, 'PNG', 0, 0, this.mapW, this.mapH);


        doc.setDrawColor(255, 255, 255)
        doc.setFillColor(255, 255, 255)
        doc.roundedRect(12, 10, 145, 25, 5, 5, 'FD')

        doc.setFontSize(20)
        doc.textWithLink(layout.title.txt, 40, 18.5, {
            maxWidth: 125,
            url: window.location.href
        })
        doc.setFontSize(10)
        doc.text(t.generatedWith.txt, 40, 23, {
            maxWidth: 125
        })
        const backgroundLayer: BaseLayer = State.state.backgroundLayer.data
        const attribution = new FixedUiElement(backgroundLayer.layer().getAttribution() ?? backgroundLayer.name).ConstructElement().innerText
        doc.textWithLink(t.attr.txt, 40, 26.5, {
            maxWidth: 125,
            url: "https://www.openstreetmap.org/copyright"
        })

        doc.text(t.attrBackground.Subs({
            background: attribution
        }).txt, 40, 30)

        let date = new Date().toISOString().substr(0, 16)

        doc.setFontSize(7)
        doc.text(t.versionInfo.Subs({
            version: Constants.vNumber,
            date: date
        }).txt, 40, 34, {
            maxWidth: 125
        })

        // Add the logo of the layout
        let img = document.createElement('img');
        const imgSource = layout.icon
        const imgType = imgSource.substr(imgSource.lastIndexOf(".") + 1);
        img.src = imgSource
        console.log(imgType)
        if (imgType.toLowerCase() === "svg") {
            new FixedUiElement("").AttachTo(this.freeDivId)

            // This is an svg image, we use the canvas to convert it to a png
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d');
            canvas.width = 500
            canvas.height = 500
            img.style.width = "100%"
            img.style.height = "100%"
            ctx.drawImage(img, 0, 0, 500, 500);
            const base64img = canvas.toDataURL("image/png")
            doc.addImage(base64img, 'png', 15, 12, 20, 20);

        } else {
            try {
                doc.addImage(img, imgType, 15, 12, 20, 20);
            } catch (e) {
                console.error(e)
            }
        }

        doc.save(`MapComplete_${layout.title.txt}_${date}.pdf`);

        this.isRunning.setData(false)
    }
}
