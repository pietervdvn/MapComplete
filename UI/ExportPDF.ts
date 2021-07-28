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

import jsPDF from "jspdf";
import {SimpleMapScreenshoter} from "leaflet-simple-map-screenshoter";
import {UIEventSource} from "../Logic/UIEventSource";
import Minimap from "./Base/Minimap";
import Loc from "../Models/Loc";
import {BBox} from "../Logic/GeoOperations";
import ShowDataLayer from "./ShowDataLayer";
import BaseLayer from "../Models/BaseLayer";
import LayoutConfig from "../Customizations/JSON/LayoutConfig";
import {FixedUiElement} from "./Base/FixedUiElement";
import Translations from "./i18n/Translations";

export default class ExportPDF {
    // dimensions of the map in milimeter
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
            features: UIEventSource<{ feature: any }[]>,
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

        const minimap = new Minimap({
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
        const bounded = options.features.map(feats => {

            const leaflet = minimap.leafletMap.data;
            if (leaflet === undefined) {
                return feats
            }
            const bounds = BBox.fromLeafletBounds(leaflet.getBounds().pad(0.2))
            return feats.filter(f => BBox.get(f.feature).isContainedIn(bounds))

        }, [minimap.leafletMap])

        // Add the features to the minimap
        new ShowDataLayer(
            bounded,
            minimap.leafletMap,
            options.layout,
            false
        )

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
        doc.roundedRect(12, 5, 125, 30, 5, 5, 'FD')

        doc.setFontSize(20)
        doc.text(layout.title.txt, 40, 20, {
            maxWidth: 100
        })
        doc.setFontSize(10)
        doc.text(t.attr.txt, 40, 25, {
            maxWidth: 100
        })
        // Add the logo of the layout
        let img = document.createElement('img');
        const imgSource = layout.icon
        img.src = imgSource
        try {
            doc.addImage(img, imgSource.substr(imgSource.lastIndexOf(".")), 15, 12, 20, 20);
        } catch (e) {
            // TODO: support svg rendering...
            console.error(e)
        }

        doc.save("MapComplete_export.pdf");


    }
}
