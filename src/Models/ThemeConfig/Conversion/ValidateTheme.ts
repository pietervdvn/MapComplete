import { DesugaringStep } from "./Conversion"
import { LayoutConfigJson } from "../Json/LayoutConfigJson"
import { AvailableRasterLayers } from "../../RasterLayers"
import { ExtractImages } from "./FixImages"
import { ConversionContext } from "./ConversionContext"
import LayoutConfig from "../LayoutConfig"
import { Utils } from "../../../Utils"
import { DetectDuplicatePresets, DoesImageExist, ValidateLanguageCompleteness } from "./Validation"

export class ValidateTheme extends DesugaringStep<LayoutConfigJson> {
    /**
     * The paths where this layer is originally saved. Triggers some extra checks
     * @private
     */
    private readonly _path?: string
    private readonly _isBuiltin: boolean
    //private readonly _sharedTagRenderings: Map<string, any>
    private readonly _validateImage: DesugaringStep<string>
    private readonly _extractImages: ExtractImages = undefined

    constructor(
        doesImageExist: DoesImageExist,
        path: string,
        isBuiltin: boolean,
        sharedTagRenderings?: Set<string>
    ) {
        super("Doesn't change anything, but emits warnings and errors", [], "ValidateTheme")
        this._validateImage = doesImageExist
        this._path = path
        this._isBuiltin = isBuiltin
        if (sharedTagRenderings) {
            this._extractImages = new ExtractImages(this._isBuiltin, sharedTagRenderings)
        }
    }

    convert(json: LayoutConfigJson, context: ConversionContext): LayoutConfigJson {
        const theme = new LayoutConfig(json, this._isBuiltin)
        {
            // Legacy format checks
            if (this._isBuiltin) {
                if (json["units"] !== undefined) {
                    context.err(
                        "The theme " +
                            json.id +
                            " has units defined - these should be defined on the layer instead. (Hint: use overrideAll: { '+units': ... }) "
                    )
                }
                if (json["roamingRenderings"] !== undefined) {
                    context.err(
                        "Theme " +
                            json.id +
                            " contains an old 'roamingRenderings'. Use an 'overrideAll' instead"
                    )
                }
            }
        }
        if (!json.title) {
            context.enter("title").err(`The theme ${json.id} does not have a title defined.`)
        }
        if (!json.icon) {
            context.enter("icon").err("A theme should have an icon")
        }
        if (this._isBuiltin && this._extractImages !== undefined) {
            // Check images: are they local, are the licenses there, is the theme icon square, ...
            const images = this._extractImages.convert(json, context.inOperation("ValidateTheme"))
            const remoteImages = images.filter((img) => img.path.indexOf("http") == 0)
            for (const remoteImage of remoteImages) {
                context.err(
                    "Found a remote image: " +
                        remoteImage.path +
                        " in theme " +
                        json.id +
                        ", please download it."
                )
            }
            for (const image of images) {
                this._validateImage.convert(image.path, context.enters(image.context))
            }
        }

        try {
            if (this._isBuiltin) {
                if (theme.id !== theme.id.toLowerCase()) {
                    context.err("Theme ids should be in lowercase, but it is " + theme.id)
                }

                const filename = this._path.substring(
                    this._path.lastIndexOf("/") + 1,
                    this._path.length - 5
                )
                if (theme.id !== filename) {
                    context.err(
                        "Theme ids should be the same as the name.json, but we got id: " +
                            theme.id +
                            " and filename " +
                            filename +
                            " (" +
                            this._path +
                            ")"
                    )
                }
                this._validateImage.convert(theme.icon, context.enter("icon"))
            }
            const dups = Utils.Duplicates(json.layers.map((layer) => layer["id"]))
            if (dups.length > 0) {
                context.err(
                    `The theme ${json.id} defines multiple layers with id ${dups.join(", ")}`
                )
            }
            if (json["mustHaveLanguage"] !== undefined) {
                new ValidateLanguageCompleteness(...json["mustHaveLanguage"]).convert(
                    theme,
                    context
                )
            }
            if (!json.hideFromOverview && theme.id !== "personal" && this._isBuiltin) {
                // The first key in the the title-field must be english, otherwise the title in the loading page will be the different language
                const targetLanguage = theme.title.SupportedLanguages()[0]
                if (targetLanguage !== "en") {
                    context.err(
                        `TargetLanguage is not 'en' for public theme ${theme.id}, it is ${targetLanguage}. Move 'en' up in the title of the theme and set it as the first key`
                    )
                }

                // Official, public themes must have a full english translation
                new ValidateLanguageCompleteness("en").convert(theme, context)
            }
        } catch (e) {
            console.error(e)
            context.err("Could not validate the theme due to: " + e)
        }

        if (theme.id !== "personal") {
            new DetectDuplicatePresets().convert(theme, context)
        }

        if (!theme.title) {
            context.enter("title").err("A theme must have a title")
        }

        if (!theme.description) {
            context.enter("description").err("A theme must have a description")
        }

        if (theme.overpassUrl && typeof theme.overpassUrl === "string") {
            context
                .enter("overpassUrl")
                .err("The overpassURL is a string, use a list of strings instead. Wrap it with [ ]")
        }

        if (json.defaultBackgroundId) {
            /*
            TODO re-enable this check
            const backgroundId = json.defaultBackgroundId

            const isCategory =
                backgroundId === "photo" || backgroundId === "map" || backgroundId === "osmbasedmap"

            if (!isCategory && !ValidateTheme._availableLayers.has(backgroundId)) {
                const options = Array.from(ValidateTheme._availableLayers)
                const nearby = Utils.sortedByLevenshteinDistance(backgroundId, options, (t) => t)
                context
                    .enter("defaultBackgroundId")
                    .err(
                        `This layer ID is not known: ${backgroundId}. Perhaps you meant one of ${nearby
                            .slice(0, 5)
                            .join(", ")}`,
                    )
            }*/
        }

        for (let i = 0; i < theme.layers.length; i++) {
            const layer = theme.layers[i]
            if (!layer.id.match("[a-z][a-z0-9_]*")) {
                context
                    .enters("layers", i, "id")
                    .err("Invalid ID:" + layer.id + "should match [a-z][a-z0-9_]*")
            }
        }

        return json
    }
}
