import { DesugaringStep, Each, On } from "./Conversion"
import { LayerConfigJson } from "../Json/LayerConfigJson"
import { ConversionContext } from "./ConversionContext"
import { TagUtils } from "../../../Logic/Tags/TagUtils"
import LayerConfig from "../LayerConfig"
import Constants from "../../Constants"
import { Utils } from "../../../Utils"
import DeleteConfig from "../DeleteConfig"
import { And } from "../../../Logic/Tags/And"
import { DoesImageExist, ValidateFilter, ValidatePointRendering } from "./Validation"
import { ValidateTagRenderings } from "./ValidateTagRenderings"

export class PrevalidateLayer extends DesugaringStep<LayerConfigJson> {
    private readonly _isBuiltin: boolean
    private readonly _doesImageExist: DoesImageExist
    /**
     * The paths where this layer is originally saved. Triggers some extra checks
     */
    private readonly _path: string
    private readonly _studioValidations: boolean
    private readonly _validatePointRendering = new ValidatePointRendering()

    constructor(
        path: string,
        isBuiltin: boolean,
        doesImageExist: DoesImageExist,
        studioValidations: boolean,
    ) {
        super("Runs various checks against common mistakes for a layer", [], "PrevalidateLayer")
        this._path = path
        this._isBuiltin = isBuiltin
        this._doesImageExist = doesImageExist
        this._studioValidations = studioValidations
    }

    convert(json: LayerConfigJson, context: ConversionContext): LayerConfigJson {
        if (json.id === undefined) {
            context.enter("id").err(`Not a valid layer: id is undefined`)
        } else {
            if (json.id?.toLowerCase() !== json.id) {
                context.enter("id").err(`The id of a layer should be lowercase: ${json.id}`)
            }
            const layerRegex = /[a-zA-Z][a-zA-Z_0-9]+/
            if (json.id.match(layerRegex) === null) {
                context.enter("id").err("Invalid ID. A layer ID should match " + layerRegex.source)
            }
        }

        if (json.source === undefined) {
            context
                .enter("source")
                .err(
                    "No source section is defined; please define one as data is not loaded otherwise",
                )
        } else {
            if (json.source === "special" || json.source === "special:library") {
            } else if (json.source && json.source["osmTags"] === undefined) {
                context
                    .enters("source", "osmTags")
                    .err(
                        "No osmTags defined in the source section - these should always be present, even for geojson layer",
                    )
            } else {
                const osmTags = TagUtils.Tag(json.source["osmTags"], context + "source.osmTags")
                if (osmTags.isNegative()) {
                    context
                        .enters("source", "osmTags")
                        .err(
                            "The source states tags which give a very wide selection: it only uses negative expressions, which will result in too much and unexpected data. Add at least one required tag. The tags are:\n\t" +
                            osmTags.asHumanString(false, false, {}),
                        )
                }
            }

            if (json.source["geoJsonSource"] !== undefined) {
                context
                    .enters("source", "geoJsonSource")
                    .err("Use 'geoJson' instead of 'geoJsonSource'")
            }

            if (json.source["geojson"] !== undefined) {
                context
                    .enters("source", "geojson")
                    .err("Use 'geoJson' instead of 'geojson' (the J is a capital letter)")
            }
        }

        if (
            json.syncSelection !== undefined &&
            LayerConfig.syncSelectionAllowed.indexOf(json.syncSelection) < 0
        ) {
            context
                .enter("syncSelection")
                .err(
                    "Invalid sync-selection: must be one of " +
                    LayerConfig.syncSelectionAllowed.map((v) => `'${v}'`).join(", ") +
                    " but got '" +
                    json.syncSelection +
                    "'",
                )
        }
        if (json["pointRenderings"]?.length > 0) {
            context
                .enter("pointRenderings")
                .err("Detected a 'pointRenderingS', it is written singular")
        }

        if (
            !(json.pointRendering?.length > 0) &&
            json.pointRendering !== null &&
            json.source !== "special" &&
            json.source !== "special:library"
        ) {
            context.enter("pointRendering").err("There are no pointRenderings at all...")
        }

        json.pointRendering?.forEach((pr, i) =>
            this._validatePointRendering.convert(pr, context.enters("pointeRendering", i)),
        )

        if (json["mapRendering"]) {
            context.enter("mapRendering").err("This layer has a legacy 'mapRendering'")
        }

        if (json.presets?.length > 0) {
            if (!(json.pointRendering?.length > 0)) {
                context.enter("presets").warn("A preset is defined, but there is no pointRendering")
            }
        }

        if (json.source === "special") {
            if (!Constants.priviliged_layers.find((x) => x == json.id)) {
                context.err(
                    "Layer " +
                    json.id +
                    " uses 'special' as source.osmTags. However, this layer is not a priviliged layer",
                )
            }
        }

        if (context.hasErrors()) {
            return undefined
        }

        if (json.tagRenderings !== undefined && json.tagRenderings.length > 0) {
            new On("tagRenderings", new Each(new ValidateTagRenderings(json)))
            if (json.title === undefined && json.source !== "special:library") {
                context
                    .enter("title")
                    .err(
                        "This layer does not have a title defined but it does have tagRenderings. Not having a title will disable the popups, resulting in an unclickable element. Please add a title. If not having a popup is intended and the tagrenderings need to be kept (e.g. in a library layer), set `title: null` to disable this error.",
                    )
            }
            if (json.title === null) {
                context.info(
                    "Title is `null`. This results in an element that cannot be clicked - even though tagRenderings is set.",
                )
            }

            {
                // Check for multiple, identical builtin questions - usability for studio users
                const duplicates = Utils.Duplicates(
                    <string[]>json.tagRenderings.filter((tr) => typeof tr === "string"),
                )
                for (let i = 0; i < json.tagRenderings.length; i++) {
                    const tagRendering = json.tagRenderings[i]
                    if (typeof tagRendering === "string" && duplicates.indexOf(tagRendering) > 0) {
                        context
                            .enters("tagRenderings", i)
                            .err(`This builtin question is used multiple times (${tagRendering})`)
                    }
                }
            }
        }

        if (json["builtin"] !== undefined) {
            context.err("This layer hasn't been expanded: " + json)
            return null
        }

        if (json.minzoom > Constants.minZoomLevelToAddNewPoint) {
            const c = context.enter("minzoom")
            const msg = `Minzoom is ${json.minzoom}, this should be at most ${Constants.minZoomLevelToAddNewPoint} as a preset is set. Why? Selecting the pin for a new item will zoom in to level before adding the point. Having a greater minzoom will hide the points, resulting in possible duplicates`
            if (json.presets?.length > 0) {
                c.err(msg)
            } else {
                c.warn(msg)
            }
        }
        {
            // duplicate ids in tagrenderings check
            const duplicates = Utils.NoNull(
                Utils.Duplicates(Utils.NoNull((json.tagRenderings ?? []).map((tr) => tr["id"]))),
            )
            if (duplicates.length > 0) {
                // It is tempting to add an index to this warning; however, due to labels the indices here might be different from the index in the tagRendering list
                context
                    .enter("tagRenderings")
                    .err(
                        "Some tagrenderings have a duplicate id: " +
                        duplicates.join(", ") +
                        "\n" +
                        JSON.stringify(
                            json.tagRenderings.filter((tr) => duplicates.indexOf(tr["id"]) >= 0),
                        ),
                    )
            }
        }

        if (json.deletion !== undefined && json.deletion instanceof DeleteConfig) {
            if (json.deletion.softDeletionTags === undefined) {
                context
                    .enter("deletion")
                    .warn("No soft-deletion tags in deletion block for layer " + json.id)
            }
        }

        try {
        } catch (e) {
            context.err("Could not validate layer due to: " + e + e.stack)
        }

        if (this._studioValidations) {
            if (!json.description) {
                context.enter("description").err("A description is required")
            }
            if (!json.name) {
                context.enter("name").err("A name is required")
            }
        }

        if (this._isBuiltin) {
            // Some checks for legacy elements

            if (json["overpassTags"] !== undefined) {
                context.err(
                    "Layer " +
                    json.id +
                    "still uses the old 'overpassTags'-format. Please use \"source\": {\"osmTags\": <tags>}' instead of \"overpassTags\": <tags> (note: this isn't your fault, the custom theme generator still spits out the old format)",
                )
            }
            const forbiddenTopLevel = [
                "icon",
                "wayHandling",
                "roamingRenderings",
                "roamingRendering",
                "label",
                "width",
                "color",
                "colour",
                "iconOverlays",
            ]
            for (const forbiddenKey of forbiddenTopLevel) {
                if (json[forbiddenKey] !== undefined)
                    context.err("Layer " + json.id + " still has a forbidden key " + forbiddenKey)
            }
            if (json["hideUnderlayingFeaturesMinPercentage"] !== undefined) {
                context.err(
                    "Layer " + json.id + " contains an old 'hideUnderlayingFeaturesMinPercentage'",
                )
            }

            if (
                json.isShown !== undefined &&
                (json.isShown["render"] !== undefined || json.isShown["mappings"] !== undefined)
            ) {
                context.warn("Has a tagRendering as `isShown`")
            }
        }
        if (this._isBuiltin) {
            // Check location of layer file
            const expected: string = `assets/layers/${json.id}/${json.id}.json`
            if (this._path != undefined && this._path.indexOf(expected) < 0) {
                context.err(
                    "Layer is in an incorrect place. The path is " +
                    this._path +
                    ", but expected " +
                    expected,
                )
            }
        }
        if (this._isBuiltin) {
            // Check for correct IDs
            if (json.tagRenderings?.some((tr) => tr["id"] === "")) {
                const emptyIndexes: number[] = []
                for (let i = 0; i < json.tagRenderings.length; i++) {
                    const tagRendering = json.tagRenderings[i]
                    if (tagRendering["id"] === "") {
                        emptyIndexes.push(i)
                    }
                }
                context
                    .enter(["tagRenderings", ...emptyIndexes])
                    .err(
                        `Some tagrendering-ids are empty or have an emtpy string; this is not allowed (at ${emptyIndexes.join(
                            ",",
                        )}])`,
                    )
            }

            const duplicateIds = Utils.Duplicates(
                (json.tagRenderings ?? [])?.map((f) => f["id"]).filter((id) => id !== "questions"),
            )
            if (duplicateIds.length > 0 && !Utils.runningFromConsole) {
                context
                    .enter("tagRenderings")
                    .err(`Some tagRenderings have a duplicate id: ${duplicateIds}`)
            }

            if (json.description === undefined) {
                if (typeof json.source === null) {
                    context.err("A priviliged layer must have a description")
                } else {
                    context.warn("A builtin layer should have a description")
                }
            }
        }

        if (json.filter) {
            new On("filter", new Each(new ValidateFilter())).convert(json, context)
        }

        if (json.tagRenderings !== undefined) {
            new On(
                "tagRenderings",
                new Each(new ValidateTagRenderings(json, this._doesImageExist)),
            ).convert(json, context)
        }

        if (json.pointRendering !== null && json.pointRendering !== undefined) {
            if (!Array.isArray(json.pointRendering)) {
                throw (
                    "pointRendering in " +
                    json.id +
                    " is not iterable, it is: " +
                    typeof json.pointRendering
                )
            }
            for (let i = 0; i < json.pointRendering.length; i++) {
                const pointRendering = json.pointRendering[i]
                if (pointRendering.marker === undefined) {
                    continue
                }
                for (const icon of pointRendering?.marker) {
                    const indexM = pointRendering?.marker.indexOf(icon)
                    if (!icon.icon) {
                        continue
                    }
                    if (icon.icon["condition"]) {
                        context
                            .enters("pointRendering", i, "marker", indexM, "icon", "condition")
                            .err(
                                "Don't set a condition in a marker as this will result in an invisible but clickable element. Use extra filters in the source instead.",
                            )
                    }
                }
            }
        }

        if (json.presets !== undefined) {
            if (typeof json.source === "string") {
                context.enter("presets").err("A special layer cannot have presets")
            }
            // Check that a preset will be picked up by the layer itself
            const baseTags = TagUtils.Tag(json.source["osmTags"])
            for (let i = 0; i < json.presets.length; i++) {
                const preset = json.presets[i]
                if (!preset) {
                    context.enters("presets", i).err("This preset is undefined")
                    continue
                }
                if (!preset.tags) {
                    context.enters("presets", i, "tags").err("No tags defined for this preset")
                    continue
                }
                if (!preset.tags) {
                    context.enters("presets", i, "title").err("No title defined for this preset")
                }

                const tags = new And(preset.tags.map((t) => TagUtils.Tag(t)))
                const properties = {}
                for (const tag of tags.asChange({ id: "node/-1" })) {
                    properties[tag.k] = tag.v
                }
                const doMatch = baseTags.matchesProperties(properties)
                if (!doMatch) {
                    context
                        .enters("presets", i, "tags")
                        .err(
                            "This preset does not match the required tags of this layer. This implies that a newly added point will not show up.\n    A newly created point will have properties: " +
                            tags.asHumanString(false, false, {}) +
                            "\n    The required tags are: " +
                            baseTags.asHumanString(false, false, {}),
                        )
                }
            }
        }
        return json
    }
}
