Data in MapComplete can come from multiple sources.

Currently, they are:

- The Overpass-API
- The OSM-API
- One or more GeoJSON files. This can be a single file or a set of tiled geojson files
- LocalStorage, containing features from a previous visit
- Changes made by the user introducing new features

When the data enters from Overpass or from the OSM-API, they are first distributed per layer:

OVERPASS | ---PerLayerFeatureSource---> FeatureSourceForLayer[]
OSM |

The GeoJSon files (not tiled) are then added to this list

A single FeatureSourcePerLayer is then further handled by splitting it into a tile hierarchy.

In order to keep thins snappy, they are distributed over a tiled database per layer.

## Notes

`cached-featuresbookcases` is the old key used `cahced-features{themeid}` and should be cleaned up