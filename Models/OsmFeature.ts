import {Feature, Geometry} from "@turf/turf";

export type RelationId = `relation/${number}`
export type WayId = `way/${number}`
export type NodeId = `node/${number}`
export type OsmId = NodeId | WayId | RelationId

export type OsmTags = Record<string, string> & {id: string}
export type OsmFeature = Feature<Geometry, OsmTags>