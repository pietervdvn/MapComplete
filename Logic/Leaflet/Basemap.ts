import L from "leaflet"
import {UIEventSource} from "../UIEventSource";
import {UIElement} from "../../UI/UIElement";


// Contains all setup and baselayers for Leaflet stuff
export class Basemap {


    public static readonly defaultLayer: { name: string, layer: any, id: string } =
        Basemap.CreateBackgroundLayer("osm", "OpenStreetMap", "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            "OpenStreetMap (ODBL)", 'https://openstreetmap.org/copyright',
            22, false);

    // @ts-ignore
    public readonly map: Map;

    public readonly Location: UIEventSource<{ zoom: number, lat: number, lon: number }>;
    public readonly LastClickLocation: UIEventSource<{ lat: number, lon: number }> = new UIEventSource<{ lat: number, lon: number }>(undefined)
    private _previousLayer: L.tileLayer = undefined;
    public readonly CurrentLayer: UIEventSource<{
        id: string,
        name: string,
        layer: L.tileLayer
    }> = new UIEventSource<L.tileLayer>(Basemap.defaultLayer);


    constructor(leafletElementId: string,
                location: UIEventSource<{ zoom: number, lat: number, lon: number }>,
                extraAttribution: UIElement) {
        this._previousLayer = Basemap.defaultLayer.layer;
        this.map = L.map(leafletElementId, {
            center: [location.data.lat ?? 0, location.data.lon ?? 0],
            zoom: location.data.zoom ?? 2,
            layers: [this._previousLayer],
        });


        // Users are not allowed to zoom to the 'copies' on the left and the right, stuff goes wrong then
        // We give a bit of leeway for people on the edges
        // Also see: https://www.reddit.com/r/openstreetmap/comments/ih4zzc/mapcomplete_a_new_easytouse_editor/g31ubyv/
        this.map.setMaxBounds(
            [[-100,-200],[100,200]]
        );
        this.map.attributionControl.setPrefix(
            extraAttribution.Render() + " | <a href='https://osm.org'>OpenStreetMap</a>");
        this.Location = location;


        this.map.zoomControl.setPosition("bottomright");
        const self = this;

        this.map.on("moveend", function () {
            location.data.zoom = self.map.getZoom();
            location.data.lat = self.map.getCenter().lat;
            location.data.lon = self.map.getCenter().lng;
            location.ping();
        });
        
        this.CurrentLayer.addCallback((layer:{layer: L.tileLayer}) => {
            if(self._previousLayer !== undefined){
                self.map.removeLayer(self._previousLayer);
            }
            self._previousLayer = layer.layer;
            self.map.addLayer(layer.layer);
        });

        this.map.on("click", function (e) {
            self.LastClickLocation.setData({lat: e.latlng.lat, lon: e.latlng.lng})
        });

        this.map.on("contextmenu", function (e) {
            self.LastClickLocation.setData({lat: e.latlng.lat, lon: e.latlng.lng});
            e.preventDefault();
        });
    }

    public static CreateBackgroundLayer(id: string, name: string, url: string, attribution: string, attributionUrl: string,
                                        maxZoom: number, isWms: boolean, isWMTS?: boolean) {

        url = url.replace("{zoom}", "{z}")
            .replace("&BBOX={bbox}", "")
            .replace("&bbox={bbox}", "");

        const subdomainsMatch = url.match(/{switch:[^}]*}/)
        let domains: string[] = [];
        if (subdomainsMatch !== null) {
            let domainsStr = subdomainsMatch[0].substr("{switch:".length);
            domainsStr = domainsStr.substr(0, domainsStr.length - 1);
            domains = domainsStr.split(",");
            url = url.replace(/{switch:[^}]*}/, "{s}")
        }


        if (isWms) {
            url = url.replace("&SRS={proj}","");
            url = url.replace("&srs={proj}","");
            const paramaters = ["format", "layers", "version", "service", "request", "styles", "transparent", "version"];
            const urlObj = new URL(url);

            const isUpper = urlObj.searchParams["LAYERS"] !== null;
            const options = {
                maxZoom: maxZoom ?? 19,
                attribution: attribution + " | ",
                subdomains: domains,
                uppercase: isUpper,
                transparent: false
            };

            for (const paramater of paramaters) {
                let p = paramater;
                if (isUpper) {
                    p = paramater.toUpperCase();
                }
                options[paramater] = urlObj.searchParams.get(p);
            }
            
            if(options.transparent === null){
                options.transparent = false;
            }


            return {
                id: id,
                name: name,
                layer: L.tileLayer.wms(urlObj.protocol+"//"+urlObj.host+urlObj.pathname,
                    options
                )
            }
        }

        if (attributionUrl) {
            attribution = `<a href='${attributionUrl}' target='_blank'>${attribution}</a>`;
        }

        return {
            id: id,
            name: name,
            layer: L.tileLayer(url,
                {
                    attribution: attribution,
                    maxZoom: maxZoom,
                    minZoom: 1,
                    wmts: isWMTS ?? false,
                    subdomains: domains
                })
        }
    }

}
