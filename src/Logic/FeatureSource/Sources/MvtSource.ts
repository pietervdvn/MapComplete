import { Feature, Geometry } from "geojson"
import { Store, UIEventSource } from "../../UIEventSource"
import { FeatureSource } from "../FeatureSource"
import Pbf from "pbf"
import * as pbfCompile from "pbf/compile"
import * as PbfSchema from "protocol-buffers-schema"

type Coords = [number, number][]

class MvtFeatureBuilder {
    private static readonly geom_types = ["Unknown", "Point", "LineString", "Polygon"] as const
    private readonly _size: number
    private readonly _x0: number
    private readonly _y0: number

    constructor(extent: number, x: number, y: number, z: number) {
        this._size = extent * Math.pow(2, z)
        this._x0 = extent * x
        this._y0 = extent * y
    }

    public toGeoJson(geometry, typeIndex, properties): Feature {
        let coords: [number, number] | Coords | Coords[] = this.encodeGeometry(geometry)
        switch (typeIndex) {
            case 1:
                const points = []
                for (let i = 0; i < coords.length; i++) {
                    points[i] = coords[i][0]
                }
                coords = points
                this.project(<any>coords)
                break

            case 2:
                for (let i = 0; i < coords.length; i++) {
                    this.project(coords[i])
                }
                break

            case 3:
                let classified = this.classifyRings(coords)
                for (let i = 0; i < coords.length; i++) {
                    for (let j = 0; j < coords[i].length; j++) {
                        this.project(classified[i][j])
                    }
                }
                break
        }

        let type: string = MvtFeatureBuilder.geom_types[typeIndex]
        if (coords.length === 1) {
            coords = coords[0]
        } else {
            type = "Multi" + type
        }

        return {
            type: "Feature",
            geometry: {
                type: <any>type,
                coordinates: <any>coords,
            },
            properties,
        }
    }

    private encodeGeometry(geometry: number[]) {
        let cX = 0
        let cY = 0
        let coordss: Coords[] = []
        let currentRing: Coords = []
        for (let i = 0; i < geometry.length; i++) {
            let commandInteger = geometry[i]
            let commandId = commandInteger & 0x7
            let commandCount = commandInteger >> 3
            /*
            Command 	Id 	Parameters 	Parameter Count
                        MoveTo 	1 	dX, dY 	2
                        LineTo 	2 	dX, dY 	2
                        ClosePath 	7 	No parameters 	0
            */
            if (commandId === 1) {
                // MoveTo means: we start a new ring
                if (currentRing.length !== 0) {
                    coordss.push(currentRing)
                    currentRing = []
                }
            }
            if (commandId === 1 || commandId === 2){
                for (let j = 0; j < commandCount; j++) {
                    const dx = geometry[i + j * 2 + 1]
                    cX += ((dx >> 1) ^ (-(dx & 1)))
                    const dy = geometry[i + j * 2 + 2]
                    cY += ((dy >> 1) ^ (-(dy & 1)))
                    currentRing.push([cX, cY])
                }
                i = commandCount * 2
            }
            if(commandId === 7){
                currentRing.push([...currentRing[0]])
            }

        }
        if (currentRing.length > 0) {
            coordss.push(currentRing)
        }
        return coordss
    }

    private signedArea(ring: Coords): number {
        let sum = 0
        const len = ring.length
        // J is basically (i - 1) % len
        let j = len - 1
        let p1
        let p2
        for (let i = 0; i < len; i++) {
            p1 = ring[i]
            p2 = ring[j]
            sum += (p2.x - p1.x) * (p1.y + p2.y)
            j = i
        }
        return sum
    }

    private classifyRings(rings: Coords[]): Coords[][] {
        const len = rings.length

        if (len <= 1) return [rings]

        const polygons = []
        let polygon
        // CounterClockWise
        let ccw: boolean

        for (let i = 0; i < len; i++) {
            const area = this.signedArea(rings[i])
            if (area === 0) continue

            if (ccw === undefined) {
                ccw = area < 0
            }
            if (ccw === (area < 0)) {
                if (polygon) {
                    polygons.push(polygon)
                }
                polygon = [rings[i]]

            } else {
                polygon.push(rings[i])
            }
        }
        if (polygon) {
            polygons.push(polygon)
        }

        return polygons
    }

    /**
     * Inline replacement of the location by projecting
     * @param line
     * @private
     */
    private project(line: [number, number][]) {
        const y0 = this._y0
        const x0 = this._x0
        const size = this._size
        for (let i = 0; i < line.length; i++) {
            let p = line[i]
            let y2 = 180 - (p[1] + y0) * 360 / size
            line[i] = [
                (p[0] + x0) * 360 / size - 180,
                360 / Math.PI * Math.atan(Math.exp(y2 * Math.PI / 180)) - 90,
            ]
        }
    }
}

export default class MvtSource implements FeatureSource {

    private static readonly schemaSpec = `
    package vector_tile;

option optimize_for = LITE_RUNTIME;

message Tile {

        // GeomType is described in section 4.3.4 of the specification
        enum GeomType {
             UNKNOWN = 0;
             POINT = 1;
             LINESTRING = 2;
             POLYGON = 3;
        }

        // Variant type encoding
        // The use of values is described in section 4.1 of the specification
        message Value {
                // Exactly one of these values must be present in a valid message
                optional string string_value = 1;
                optional float float_value = 2;
                optional double double_value = 3;
                optional int64 int_value = 4;
                optional uint64 uint_value = 5;
                optional sint64 sint_value = 6;
                optional bool bool_value = 7;

                extensions 8 to max;
        }

        // Features are described in section 4.2 of the specification
        message Feature {
                optional uint64 id = 1 [ default = 0 ];

                // Tags of this feature are encoded as repeated pairs of
                // integers.
                // A detailed description of tags is located in sections
                // 4.2 and 4.4 of the specification
                repeated uint32 tags = 2 [ packed = true ];

                // The type of geometry stored in this feature.
                optional GeomType type = 3 [ default = UNKNOWN ];

                // Contains a stream of commands and parameters (vertices).
                // A detailed description on geometry encoding is located in
                // section 4.3 of the specification.
                repeated uint32 geometry = 4 [ packed = true ];
        }

        // Layers are described in section 4.1 of the specification
        message Layer {
                // Any compliant implementation must first read the version
                // number encoded in this message and choose the correct
                // implementation for this version number before proceeding to
                // decode other parts of this message.
                required uint32 version = 15 [ default = 1 ];

                required string name = 1;

                // The actual features in this tile.
                repeated Feature features = 2;

                // Dictionary encoding for keys
                repeated string keys = 3;

                // Dictionary encoding for values
                repeated Value values = 4;

                // Although this is an "optional" field it is required by the specification.
                // See https://github.com/mapbox/vector-tile-spec/issues/47
                optional uint32 extent = 5 [ default = 4096 ];

                extensions 16 to max;
        }

        repeated Layer layers = 3;

        extensions 16 to 8191;
}
`
    private static readonly tile_schema = pbfCompile(PbfSchema.parse(MvtSource.schemaSpec)).Tile


    private readonly _url: string
    private readonly _layerName: string
    private readonly _features: UIEventSource<Feature<Geometry, {
        [name: string]: any
    }>[]> = new UIEventSource<Feature<Geometry, { [p: string]: any }>[]>([])
    public readonly features: Store<Feature<Geometry, { [name: string]: any }>[]> = this._features
    private readonly x: number
    private readonly y: number
    private readonly z: number

    constructor(url: string, x: number, y: number, z: number, layerName?: string) {
        this._url = url
        this._layerName = layerName
        this.x = x
        this.y = y
        this.z = z
        this.downloadSync()
    }

    private getValue(v: {
        // Exactly one of these values must be present in a valid message
        string_value?: string,
        float_value?: number,
        double_value?: number,
        int_value?: number,
        uint_value?: number,
        sint_value?: number,
        bool_value?: boolean
    }): string | number | undefined | boolean {
        if (v.string_value !== "") {
            return v.string_value
        }
        if (v.double_value !== 0) {
            return v.double_value
        }
        if (v.float_value !== 0) {
            return v.float_value
        }
        if (v.int_value !== 0) {
            return v.int_value
        }
        if (v.uint_value !== 0) {
            return v.uint_value
        }
        if (v.sint_value !== 0) {
            return v.sint_value
        }
        if (v.bool_value !== false) {
            return v.bool_value
        }
        return undefined

    }

    private downloadSync(){
        this.download().then(d => {
            if(d.length === 0){
                return
            }
            return this._features.setData(d)
        }).catch(e => {console.error(e)})
    }
    private async download(): Promise<Feature[]> {
        const result = await fetch(this._url)
        const buffer = await result.arrayBuffer()
        const data = MvtSource.tile_schema.read(new Pbf(buffer))
        const layers = data.layers
        let layer = data.layers[0]
        if (layers.length > 1) {
            if (!this._layerName) {
                throw "Multiple layers in the downloaded tile, but no layername is given to choose from"
            }
            layer = layers.find(l => l.name === this._layerName)
        }
        if(!layer){
            return []
        }
        const builder = new MvtFeatureBuilder(layer.extent, this.x, this.y, this.z)
        const features: Feature[] = []

        for (const feature of layer.features) {
            const properties = this.inflateProperties(feature.tags, layer.keys, layer.values)
            features.push(builder.toGeoJson(feature.geometry, feature.type, properties))
        }

        return features
    }


    private inflateProperties(tags: number[], keys: string[], values: { string_value: string }[]) {
        const properties = {}
        for (let i = 0; i < tags.length; i += 2) {
            properties[keys[tags[i]]] = this.getValue(values[tags[i + 1]])
        }
        let type: string
        switch (properties["osm_type"]) {
            case "N":
                type = "node"
                break
            case "W":
                type = "way"
                break
            case "R":
                type = "relation"
                break
        }
        properties["id"] = type + "/" + properties["osm_id"]
        delete properties["osm_id"]
        delete properties["osm_type"]

        return properties
    }

}
