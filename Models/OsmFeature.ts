import {Feature, Geometry} from "@turf/turf";

export type OsmTags = Record<string, string> & {id: string}
export type OsmFeature = Feature<Geometry, OsmTags>