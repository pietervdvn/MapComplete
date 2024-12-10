import { Utils } from "../../Utils"
import { Feature, Polygon } from "geojson"
import { OsmFeature } from "../../Models/OsmFeature"
export interface ChangeSetData extends Feature<Polygon> {
    id: number
    type: "Feature"
    geometry: {
        type: "Polygon"
        coordinates: [number, number][][]
    }
    properties: {
        check_user: null
        reasons: []
        tags: []
        features: []
        user: string
        uid: string
        editor: string
        comment: string
        comments_count: number
        source: string
        imagery_used: string
        date: string
        reviewed_features: []
        create: number
        modify: number
        delete: number
        area: number
        is_suspect: boolean
        //  harmful: any
        checked: boolean
        //   check_date: any
        host: string
        theme: string
        imagery: string
        language: string
    }
}

export class ChangesetsOverview {
    private static readonly theme_remappings = {
        metamap: "maps",
        groen: "buurtnatuur",
        "updaten van metadata met mapcomplete": "buurtnatuur",
        "Toevoegen of dit natuurreservaat toegangkelijk is": "buurtnatuur",
        "wiki:mapcomplete/fritures": "fritures",
        "wiki:MapComplete/Fritures": "fritures",
        lits: "lit",
        pomp: "cyclofix",
        "wiki:user:joost_schouppe/campersite": "campersite",
        "wiki-user-joost_schouppe-geveltuintjes": "geveltuintjes",
        "wiki-user-joost_schouppe-campersite": "campersite",
        "wiki-User-joost_schouppe-campersite": "campersite",
        "wiki-User-joost_schouppe-geveltuintjes": "geveltuintjes",
        "wiki:User:joost_schouppe/campersite": "campersite",
        arbres: "arbres_llefia",
        aed_brugge: "aed",
        "https://llefia.org/arbres/mapcomplete.json": "arbres_llefia",
        "https://llefia.org/arbres/mapcomplete1.json": "arbres_llefia",
        "toevoegen of dit natuurreservaat toegangkelijk is": "buurtnatuur",
        "testing mapcomplete 0.0.0": "buurtnatuur",
        entrances: "indoor",
        "https://raw.githubusercontent.com/osmbe/play/master/mapcomplete/geveltuinen/geveltuinen.json":
            "geveltuintjes",
    }

    public static readonly valuesToSum: ReadonlyArray<string> = [
        "create",
        "modify",
        "delete",
        "answer",
        "move",
        "deletion",
        "add-image",
        "plantnet-ai-detection",
        "import",
        "conflation",
        "link-image",
        "soft-delete",
    ]
    public readonly _meta: (ChangeSetData & OsmFeature)[]

    private constructor(meta: (ChangeSetData & OsmFeature)[]) {
        this._meta = Utils.NoNull(meta)
    }

    public static fromDirtyData(meta: (ChangeSetData & OsmFeature)[]): ChangesetsOverview {
        return new ChangesetsOverview(meta?.map((cs) => ChangesetsOverview.cleanChangesetData(cs)))
    }

    private static cleanChangesetData(cs: ChangeSetData & OsmFeature): ChangeSetData & OsmFeature {
        if (cs === undefined) {
            return undefined
        }
        if (cs.properties.editor?.startsWith("iD")) {
            // We also fetch based on hashtag, so some edits with iD show up as well
            return undefined
        }
        if (cs.properties.theme === undefined) {
            cs.properties.theme = cs.properties.comment.substr(
                cs.properties.comment.lastIndexOf("#") + 1
            )
        }
        cs.properties.theme = cs.properties.theme.toLowerCase()
        const remapped = ChangesetsOverview.theme_remappings[cs.properties.theme]
        cs.properties.theme = remapped ?? cs.properties.theme
        if (cs.properties.theme.startsWith("https://raw.githubusercontent.com/")) {
            cs.properties.theme =
                "gh://" + cs.properties.theme.substr("https://raw.githubusercontent.com/".length)
        }
        if (cs.properties.modify + cs.properties.delete + cs.properties.create == 0) {
            cs.properties.theme = "EMPTY CS"
        }
        try {
            cs.properties.host = new URL(cs.properties.host).host
        } catch (e) {
            // pass
        }
        return cs
    }

    public filter(predicate: (cs: ChangeSetData) => boolean) {
        return new ChangesetsOverview(this._meta.filter(predicate))
    }

    public sum(key: string, excludeThemes: Set<string>): number {
        let s = 0
        for (const feature of this._meta) {
            if (excludeThemes.has(feature.properties.theme)) {
                continue
            }
            const parsed = Number(feature.properties[key])
            if (!isNaN(parsed)) {
                s += parsed
            }
        }
        return s
    }
}
