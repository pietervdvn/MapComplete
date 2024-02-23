import { Feature as GeojsonFeature, Geometry } from "geojson"

import { Store, UIEventSource } from "../../UIEventSource"
import { FeatureSourceForTile, UpdatableFeatureSource } from "../FeatureSource"
import Pbf from "pbf"

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

    private static signedArea(ring: Coords): number {
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

    /**
     *
     * const rings = [   [     [       3.208361864089966,       51.186908820014736     ],     [       3.2084155082702637,       51.18689537073311     ],     [       3.208436965942383,       51.186888646090836     ],     [       3.2084155082702637,       51.18686174751187     ],     [       3.2084155082702637,       51.18685502286465     ],     [       3.2083725929260254,       51.18686847215807     ],     [       3.2083404064178467,       51.18687519680333     ],     [       3.208361864089966,       51.186908820014736     ]   ] ]
     * MvtFeatureBuilder.classifyRings(rings) // => [rings]
     */
    private static classifyRings(rings: Coords[]): Coords[][] {
        if (rings.length <= 0) {
            throw "Now rings in polygon found"
        }
        if (rings.length == 1) {
            return [rings]
        }

        const polygons: Coords[][] = []
        let currentPolygon: Coords[]

        for (let i = 0; i < rings.length; i++) {
            let ring = rings[i]
            const area = this.signedArea(ring)
            if (area === 0) {
                // Weird, degenerate ring
                continue
            }
            const ccw = area < 0

            if (ccw === area < 0) {
                if (currentPolygon) {
                    polygons.push(currentPolygon)
                }
                currentPolygon = [ring]
            } else {
                currentPolygon.push(ring)
            }
        }
        if (currentPolygon) {
            polygons.push(currentPolygon)
        }

        return polygons
    }

    public toGeoJson(geometry: number[], typeIndex: 1 | 2 | 3, properties: any): GeojsonFeature {
        let coords: Coords[] = this.encodeGeometry(geometry)
        let classified = undefined
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
                classified = MvtFeatureBuilder.classifyRings(coords)
                for (let i = 0; i < classified.length; i++) {
                    for (let j = 0; j < classified[i].length; j++) {
                        this.project(classified[i][j])
                    }
                }
                break
        }

        let type: string = MvtFeatureBuilder.geom_types[typeIndex]
        let polygonCoords: Coords | Coords[] | Coords[][]
        if (coords.length === 1) {
            polygonCoords = (classified ?? coords)[0]
        } else {
            polygonCoords = classified ?? coords
            type = "Multi" + type
        }

        return {
            type: "Feature",
            geometry: {
                type: <any>type,
                coordinates: <any>polygonCoords,
            },
            properties,
        }
    }

    /**
     *
     * const geometry = [9,233,8704,130,438,1455,270,653,248,423,368,493,362,381,330,267,408,301,406,221,402,157,1078,429,1002,449,1036,577,800,545,1586,1165,164,79,40]
     * const builder = new MvtFeatureBuilder(4096, 66705, 43755, 17)
     * const expected = [[3.2106759399175644,51.213658395282124],[3.2108227908611298,51.21396418776169],[3.2109133154153824,51.21410154168976],[3.210996463894844,51.214190590500664],[3.211119845509529,51.214294340548975],[3.211241215467453,51.2143745681588],[3.2113518565893173,51.21443085341426],[3.211488649249077,51.21449427925393],[3.2116247713565826,51.214540903490956],[3.211759552359581,51.21457408647774],[3.2121209800243378,51.214664394485254],[3.212456926703453,51.21475890267553],[3.2128042727708817,51.214880292910834],[3.213072493672371,51.214994962285544],[3.2136042416095734,51.21523984134939],[3.2136592268943787,51.21525664260963],[3.213672637939453,51.21525664260963]]
     * builder.project(builder.encodeGeometry(geometry)[0]) // => expected
     * @param geometry
     * @private
     */
    private encodeGeometry(geometry: number[]): Coords[] {
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
            if (commandId === 1 || commandId === 2) {
                for (let j = 0; j < commandCount; j++) {
                    const dx = geometry[i + j * 2 + 1]
                    cX += (dx >> 1) ^ -(dx & 1)
                    const dy = geometry[i + j * 2 + 2]
                    cY += (dy >> 1) ^ -(dy & 1)
                    currentRing.push([cX, cY])
                }
                i += commandCount * 2
            }
            if (commandId === 7) {
                currentRing.push([...currentRing[0]])
                i++
            }
        }
        if (currentRing.length > 0) {
            coordss.push(currentRing)
        }
        return coordss
    }

    /**
     * Inline replacement of the location by projecting
     * @param line the line which will be rewritten inline
     * @return line
     */
    private project(line: Coords) {
        const y0 = this._y0
        const x0 = this._x0
        const size = this._size
        for (let i = 0; i < line.length; i++) {
            let p = line[i]
            let y2 = 180 - ((p[1] + y0) * 360) / size
            line[i] = [
                ((p[0] + x0) * 360) / size - 180,
                (360 / Math.PI) * Math.atan(Math.exp((y2 * Math.PI) / 180)) - 90,
            ]
        }
        return line
    }
}

class Layer {
    public static read(pbf, end) {
        return pbf.readFields(
            Layer._readField,
            { version: 0, name: "", features: [], keys: [], values: [], extent: 0 },
            end
        )
    }

    static _readField(tag, obj, pbf) {
        if (tag === 15) obj.version = pbf.readVarint()
        else if (tag === 1) obj.name = pbf.readString()
        else if (tag === 2) obj.features.push(Feature.read(pbf, pbf.readVarint() + pbf.pos))
        else if (tag === 3) obj.keys.push(pbf.readString())
        else if (tag === 4) obj.values.push(Value.read(pbf, pbf.readVarint() + pbf.pos))
        else if (tag === 5) obj.extent = pbf.readVarint()
    }

    public static write(obj, pbf) {
        if (obj.version) pbf.writeVarintField(15, obj.version)
        if (obj.name) pbf.writeStringField(1, obj.name)
        if (obj.features)
            for (var i = 0; i < obj.features.length; i++)
                pbf.writeMessage(2, Feature.write, obj.features[i])
        if (obj.keys) for (i = 0; i < obj.keys.length; i++) pbf.writeStringField(3, obj.keys[i])
        if (obj.values)
            for (i = 0; i < obj.values.length; i++) pbf.writeMessage(4, Value.write, obj.values[i])
        if (obj.extent) pbf.writeVarintField(5, obj.extent)
    }
}

class Feature {
    static read(pbf, end) {
        return pbf.readFields(Feature._readField, { id: 0, tags: [], type: 0, geometry: [] }, end)
    }

    static _readField(tag, obj, pbf) {
        if (tag === 1) obj.id = pbf.readVarint()
        else if (tag === 2) pbf.readPackedVarint(obj.tags)
        else if (tag === 3) obj.type = pbf.readVarint()
        else if (tag === 4) pbf.readPackedVarint(obj.geometry)
    }

    public static write(obj, pbf) {
        if (obj.id) pbf.writeVarintField(1, obj.id)
        if (obj.tags) pbf.writePackedVarint(2, obj.tags)
        if (obj.type) pbf.writeVarintField(3, obj.type)
        if (obj.geometry) pbf.writePackedVarint(4, obj.geometry)
    }
}

class Value {
    public static read(pbf, end) {
        return pbf.readFields(
            Value._readField,
            {
                string_value: "",
                float_value: 0,
                double_value: 0,
                int_value: 0,
                uint_value: 0,
                sint_value: 0,
                bool_value: false,
            },
            end
        )
    }

    static _readField = function (tag, obj, pbf) {
        if (tag === 1) obj.string_value = pbf.readString()
        else if (tag === 2) obj.float_value = pbf.readFloat()
        else if (tag === 3) obj.double_value = pbf.readDouble()
        else if (tag === 4) obj.int_value = pbf.readVarint(true)
        else if (tag === 5) obj.uint_value = pbf.readVarint()
        else if (tag === 6) obj.sint_value = pbf.readSVarint()
        else if (tag === 7) obj.bool_value = pbf.readBoolean()
    }

    public static write(obj, pbf) {
        if (obj.string_value) pbf.writeStringField(1, obj.string_value)
        if (obj.float_value) pbf.writeFloatField(2, obj.float_value)
        if (obj.double_value) pbf.writeDoubleField(3, obj.double_value)
        if (obj.int_value) pbf.writeVarintField(4, obj.int_value)
        if (obj.uint_value) pbf.writeVarintField(5, obj.uint_value)
        if (obj.sint_value) pbf.writeSVarintField(6, obj.sint_value)
        if (obj.bool_value) pbf.writeBooleanField(7, obj.bool_value)
    }
}

class Tile {
    // code generated by pbf v3.2.1

    static GeomType = {
        UNKNOWN: {
            value: 0,
            options: {},
        },
        POINT: {
            value: 1,
            options: {},
        },
        LINESTRING: {
            value: 2,
            options: {},
        },
        POLYGON: {
            value: 3,
            options: {},
        },
    }

    public static read(pbf, end) {
        return pbf.readFields(Tile._readField, { layers: [] }, end)
    }

    static _readField(tag, obj, pbf) {
        if (tag === 3) obj.layers.push(Layer.read(pbf, pbf.readVarint() + pbf.pos))
    }

    static write(obj, pbf) {
        if (obj.layers)
            for (var i = 0; i < obj.layers.length; i++)
                pbf.writeMessage(3, Layer.write, obj.layers[i])
    }
}

export default class MvtSource implements FeatureSourceForTile, UpdatableFeatureSource {
    public readonly features: Store<GeojsonFeature<Geometry, { [name: string]: any }>[]>
    public readonly x: number
    public readonly y: number
    public readonly z: number
    private readonly _url: string
    private readonly _layerName: string
    private readonly _features: UIEventSource<
        GeojsonFeature<
            Geometry,
            {
                [name: string]: any
            }
        >[]
    > = new UIEventSource<GeojsonFeature<Geometry, { [p: string]: any }>[]>([])
    private currentlyRunning: Promise<any>

    constructor(
        url: string,
        x: number,
        y: number,
        z: number,
        layerName?: string,
        isActive?: Store<boolean>
    ) {
        this._url = url
        this._layerName = layerName
        this.x = x
        this.y = y
        this.z = z
        this.updateAsync()
        this.features = this._features.map(
            (fs) => {
                if (fs === undefined || isActive?.data === false) {
                    return []
                }
                return fs
            },
            [isActive]
        )
    }

    async updateAsync() {
        if (!this.currentlyRunning) {
            this.currentlyRunning = this.download()
        }
        await this.currentlyRunning
    }

    private getValue(v: {
        // Exactly one of these values must be present in a valid message
        string_value?: string
        float_value?: number
        double_value?: number
        int_value?: number
        uint_value?: number
        sint_value?: number
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

    private async download(): Promise<void> {
        try {
            const result = await fetch(this._url)
            if (result.status !== 200) {
                console.error("Could not download tile " + this._url)
                return
            }
            const buffer = await result.arrayBuffer()
            const data = Tile.read(new Pbf(buffer), undefined)
            const layers = data.layers
            let layer = data.layers[0]
            if (layers.length > 1) {
                if (!this._layerName) {
                    throw "Multiple layers in the downloaded tile, but no layername is given to choose from"
                }
                layer = layers.find((l) => l.name === this._layerName)
            }
            if (!layer) {
                return
            }
            const builder = new MvtFeatureBuilder(layer.extent, this.x, this.y, this.z)
            const features: GeojsonFeature[] = []

            for (const feature of layer.features) {
                const properties = this.inflateProperties(feature.tags, layer.keys, layer.values)
                features.push(builder.toGeoJson(feature.geometry, feature.type, properties))
            }
            this._features.setData(features)
        } catch (e) {
            console.error("Could not download MVT tile due to", e)
        }
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
