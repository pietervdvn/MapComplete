import {Utils} from "./Utils";

const features = []
for (let lat = 49; lat < 52; lat+=0.05) {
    for (let lon = 2.5; lon < 6.5; lon+=0.025) {
        features.push({
            type:"Feature",
            properties: {},
            geometry:{
                type:"Point",
                coordinates: [lon, lat]
            }
        })
    }
}

const geojson = {
    type:"FeatureCollection",
    features
}

Utils.offerContentsAsDownloadableFile(JSON.stringify(geojson, null, "  "), "raster.geojson",{
    mimetype:"application/geo+json"
})