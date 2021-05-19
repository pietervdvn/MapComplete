import ScriptUtils from "./ScriptUtils";
import {Utils} from "../Utils";
import {readFileSync, writeFileSync} from "fs";

Utils.runningFromConsole = true
import LayerConfig from "../Customizations/JSON/LayerConfig";
import * as licenses from "../assets/generated/license_info.json"
import LayoutConfig from "../Customizations/JSON/LayoutConfig";
import {LayerConfigJson} from "../Customizations/JSON/LayerConfigJson";
import {Translation} from "../UI/i18n/Translation";
import {LayoutConfigJson} from "../Customizations/JSON/LayoutConfigJson";
// This scripts scans 'assets/layers/*.json' for layer definition files and 'assets/themes/*.json' for theme definition files.
// It spits out an overview of those to be used to load them

interface LayersAndThemes {
    themes: any[],
    layers: { parsed: any, path: string }[]
}


class LayerOverviewUtils {

    loadThemesAndLayers(): LayersAndThemes {

        const layerFiles = ScriptUtils.getLayerFiles();

        const themeFiles: LayoutConfigJson[] = ScriptUtils.getThemeFiles().map(x => x.parsed);

        console.log("Discovered", layerFiles.length, "layers and", themeFiles.length, "themes\n")
        return {
            layers: layerFiles,
            themes: themeFiles
        }
    }


    writeFiles(lt: LayersAndThemes) {
        writeFileSync("./assets/generated/known_layers_and_themes.json", JSON.stringify({
            "layers": lt.layers.map(l => l.parsed),
            "themes": lt.themes
        }))
    }


    validateLayer(layerJson: LayerConfigJson, path: string, knownPaths: Set<string>, context?: string): string[] {
        let errorCount = [];
        if (layerJson["overpassTags"] !== undefined) {
            errorCount.push("Layer " + layerJson.id + "still uses the old 'overpassTags'-format. Please use \"source\": {\"osmTags\": <tags>}' instead of \"overpassTags\": <tags> (note: this isn't your fault, the custom theme generator still spits out the old format)")
        }
        try {
            const layer = new LayerConfig(layerJson, "test", true)
            const images = Array.from(layer.ExtractImages())
            const remoteImages = images.filter(img => img.indexOf("http") == 0)
            for (const remoteImage of remoteImages) {
                errorCount.push("Found a remote image: " + remoteImage + " in layer " + layer.id + ", please download it. You can use the fixTheme script to automate this")
            }
            const expected: string = `assets/layers/${layer.id}/${layer.id}.json`
            if (path != undefined && path.indexOf(expected) < 0) {
                errorCount.push("Layer is in an incorrect place. The path is " + path + ", but expected " + expected)
            }

            for (const image of images) {
                if (image.indexOf("{") >= 0) {
                    console.warn("Ignoring image with { in the path: ", image)
                    continue
                }

                if (!knownPaths.has(image)) {
                    const ctx = context === undefined ? "" : ` in a layer defined in the theme ${context}`
                    errorCount.push(`Image with path ${image} not found or not attributed; it is used in ${layer.id}${ctx}`)
                }
            }

        } catch (e) {
            console.error(e)
            return [`Layer ${layerJson.id}` ?? JSON.stringify(layerJson).substring(0, 50) + " is invalid: " + e]
        }
        return errorCount
    }

    validateTranslationCompletenessOfObject(object: any, expectedLanguages: string[], context: string) {
        const missingTranlations = []
        const translations: { tr: Translation, context: string }[] = [];
        const queue: { object: any, context: string }[] = [{object: object, context: context}]

        while (queue.length > 0) {
            const item = queue.pop();
            const o = item.object
            for (const key in o) {
                const v = o[key];
                if (v === undefined) {
                    continue;
                }
                if (v instanceof Translation || v?.translations !== undefined) {
                    translations.push({tr: v, context: item.context});
                } else if (
                    ["string", "function", "boolean", "number"].indexOf(typeof (v)) < 0) {
                    queue.push({object: v, context: item.context + "." + key})
                }
            }
        }

        const missing = {}
        const present = {}
        for (const ln of expectedLanguages) {
            missing[ln] = 0;
            present[ln] = 0;
            for (const translation of translations) {
                if (translation.tr.translations["*"] !== undefined) {
                    continue;
                }
                const txt = translation.tr.translations[ln];
                const isMissing = txt === undefined || txt === "" || txt.toLowerCase().indexOf("todo") >= 0;
                if (isMissing) {
                    missingTranlations.push(`${translation.context},${ln},${translation.tr.txt}`)
                    missing[ln]++
                } else {
                    present[ln]++;
                }
            }
        }

        let message = `Translation completeness for ${context}`
        let isComplete = true;
        for (const ln of expectedLanguages) {
            const amiss = missing[ln];
            const ok = present[ln];
            const total = amiss + ok;
            message += ` ${ln}: ${ok}/${total}`
            if (ok !== total) {
                isComplete = false;
            }
        }
        return missingTranlations

    }

    main(args: string[]) {

        const lt = this.loadThemesAndLayers();
        const layerFiles = lt.layers;
        const themeFiles = lt.themes;

        console.log("   ---------- VALIDATING ---------")
        const licensePaths = []
        for (const i in licenses) {
            licensePaths.push(licenses[i].path)
        }
        const knownPaths = new Set<string>(licensePaths)

        let layerErrorCount = []
        const knownLayerIds = new Map<string, LayerConfig>();
        for (const layerFile of layerFiles) {

            layerErrorCount.push(...this.validateLayer(layerFile.parsed, layerFile.path, knownPaths))
            knownLayerIds.set(layerFile.parsed.id, new LayerConfig(layerFile.parsed))
        }

        let themeErrorCount = []
        let missingTranslations = []
        for (const themeFile of themeFiles) {
            if (typeof themeFile.language === "string") {
                themeErrorCount.push("The theme " + themeFile.id + " has a string as language. Please use a list of strings")
            }
            for (const layer of themeFile.layers) {
                if (typeof layer === "string") {
                    if (!knownLayerIds.has(layer)) {
                        themeErrorCount.push(`Unknown layer id: ${layer} in theme ${themeFile.id}`)
                    } else {
                        const layerConfig = knownLayerIds.get(layer);
                        missingTranslations.push(...this.validateTranslationCompletenessOfObject(layerConfig, themeFile.language, "Layer " + layer))

                    }
                } else {
                    if (layer.builtin !== undefined) {
                        if (!knownLayerIds.has(layer.builtin)) {
                            themeErrorCount.push("Unknown layer id: " + layer.builtin + "(which uses inheritance)")
                        }
                    } else {
                        // layer.builtin contains layer overrides - we can skip those
                        layerErrorCount.push(...this.validateLayer(layer, undefined, knownPaths, themeFile.id))
                    }
                }
            }

            themeFile.layers = themeFile.layers
                .filter(l => typeof l != "string") // We remove all the builtin layer references as they don't work with ts-node for some weird reason
                .filter(l => l.builtin === undefined)

            missingTranslations.push(...this.validateTranslationCompletenessOfObject(themeFile, themeFile.language, "Theme " + themeFile.id))

            try {
                const theme = new LayoutConfig(themeFile, true, "test")
                if (theme.id !== theme.id.toLowerCase()) {
                    themeErrorCount.push("Theme ids should be in lowercase, but it is " + theme.id)
                }
            } catch (e) {
                themeErrorCount.push("Could not parse theme " + themeFile["id"] + "due to", e)
            }
        }

        if (missingTranslations.length > 0) {
            console.log(missingTranslations.length, "missing translations")
            writeFileSync("missing_translations.txt", missingTranslations.join("\n"))
        }

        if (layerErrorCount.length + themeErrorCount.length == 0) {
            console.log("All good!")

            // We load again from disc, as modifications were made above
            const lt = this.loadThemesAndLayers();
            this.writeFiles(lt);
        } else {
            const errors = layerErrorCount.concat(themeErrorCount).join("\n")
            console.log(errors)
            const msg = (`Found ${layerErrorCount.length} errors in the layers; ${themeErrorCount.length} errors in the themes`)
            console.log(msg)
            if (process.argv.indexOf("--report") >= 0) {
                console.log("Writing report!")
                writeFileSync("layer_report.txt", errors)
            }

            if (process.argv.indexOf("--no-fail") < 0) {
                throw msg;
            }
        }
    }
}

new LayerOverviewUtils().main(process.argv)