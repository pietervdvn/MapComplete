import ScriptUtils from "./ScriptUtils";
import {existsSync, mkdirSync, readFileSync, writeFileSync} from "fs";
import * as licenses from "../assets/generated/license_info.json"
import {LayoutConfigJson} from "../Models/ThemeConfig/Json/LayoutConfigJson";
import {LayerConfigJson} from "../Models/ThemeConfig/Json/LayerConfigJson";
import Constants from "../Models/Constants";
import {PrevalidateTheme, ValidateLayer, ValidateThemeAndLayers} from "../Models/ThemeConfig/Conversion/Validation";
import {Translation} from "../UI/i18n/Translation";
import {TagRenderingConfigJson} from "../Models/ThemeConfig/Json/TagRenderingConfigJson";
import * as questions from "../assets/tagRenderings/questions.json";
import * as icons from "../assets/tagRenderings/icons.json";
import PointRenderingConfigJson from "../Models/ThemeConfig/Json/PointRenderingConfigJson";
import {PrepareLayer} from "../Models/ThemeConfig/Conversion/PrepareLayer";
import {PrepareTheme} from "../Models/ThemeConfig/Conversion/PrepareTheme";
import {DesugaringContext} from "../Models/ThemeConfig/Conversion/Conversion";

// This scripts scans 'assets/layers/*.json' for layer definition files and 'assets/themes/*.json' for theme definition files.
// It spits out an overview of those to be used to load them

class LayerOverviewUtils {

    writeSmallOverview(themes: { id: string, title: any, shortDescription: any, icon: string, hideFromOverview: boolean, mustHaveLanguage: boolean }[]) {
        const perId = new Map<string, any>();
        for (const theme of themes) {
            const data = {
                id: theme.id,
                title: theme.title,
                shortDescription: theme.shortDescription,
                icon: theme.icon,
                hideFromOverview: theme.hideFromOverview,
                mustHaveLanguage: theme.mustHaveLanguage
            }
            perId.set(theme.id, data);
        }


        const sorted = Constants.themeOrder.map(id => {
            if (!perId.has(id)) {
                throw "Ordered theme id " + id + " not found"
            }
            return perId.get(id);
        });


        perId.forEach((value) => {
            if (Constants.themeOrder.indexOf(value.id) >= 0) {
                return; // actually a continue
            }
            sorted.push(value)
        })

        writeFileSync("./assets/generated/theme_overview.json", JSON.stringify(sorted, null, "  "), "UTF8");
    }

    writeTheme(theme: LayoutConfigJson) {
        if (!existsSync("./assets/generated/themes")) {
            mkdirSync("./assets/generated/themes");
        }
        writeFileSync(`./assets/generated/themes/${theme.id}.json`, JSON.stringify(theme, null, "  "), "UTF8");
    }

    writeLayer(layer: LayerConfigJson) {
        if (!existsSync("./assets/generated/layers")) {
            mkdirSync("./assets/generated/layers");
        }
        writeFileSync(`./assets/generated/layers/${layer.id}.json`, JSON.stringify(layer, null, "  "), "UTF8");
    }

    getSharedTagRenderings(): Map<string, TagRenderingConfigJson> {
        const dict = new Map<string, TagRenderingConfigJson>();

        for (const key in questions["default"]) {
            if (key === "id") {
                continue
            }
            questions[key].id = key;
            questions[key]["source"] = "shared-questions"
            dict.set(key, <TagRenderingConfigJson>questions[key])
        }
        for (const key in icons["default"]) {
            if (key === "id") {
                continue
            }
            if (typeof icons[key] !== "object") {
                continue
            }
            icons[key].id = key;
            dict.set(key, <TagRenderingConfigJson>icons[key])
        }

        dict.forEach((value, key) => {
            if (key === "id") {
                return
            }
            value.id = value.id ?? key;
        })

        return dict;
    }

    checkAllSvgs() {
        const allSvgs = ScriptUtils.readDirRecSync("./assets")
            .filter(path => path.endsWith(".svg"))
            .filter(path => !path.startsWith("./assets/generated"))
        let errCount = 0;
        for (const path of allSvgs) {
            if(path.indexOf("assets/SocialImageTemplate") >= 0){
                continue
            }
            const contents = readFileSync(path, "UTF8")
            if (contents.indexOf("data:image/png;") < 0) {
                continue;
            }
            console.warn("The SVG at " + path + " is a fake SVG: it contains PNG data!")
            errCount++;
            if (path.startsWith("./assets/svg")) {
                throw "A core SVG is actually a PNG. Don't do this!"
            }
        }
        if (errCount > 0) {
            throw `There are ${errCount} fake svgs`
        }
    }


    main(_: string[]) {

        const licensePaths = new Set<string>()
        for (const i in licenses) {
            licensePaths.add(licenses[i].path)
        }

        const sharedLayers = this.buildLayerIndex(licensePaths);
        const sharedThemes = this.buildThemeIndex(licensePaths, sharedLayers)

        writeFileSync("./assets/generated/known_layers_and_themes.json", JSON.stringify({
            "layers": Array.from(sharedLayers.values()),
            "themes": Array.from(sharedThemes.values())
        }))

        writeFileSync("./assets/generated/known_layers.json", JSON.stringify({layers: Array.from(sharedLayers.values())}))


        {
            // mapcomplete-changes shows an icon for each corresponding mapcomplete-theme
            const iconsPerTheme =
                Array.from(sharedThemes.values()).map(th => ({
                    if: "theme=" + th.id,
                    then: th.icon
                }))
            const proto: LayoutConfigJson = JSON.parse(readFileSync("./assets/themes/mapcomplete-changes/mapcomplete-changes.proto.json", "UTF8"));
            const protolayer = <LayerConfigJson>(proto.layers.filter(l => l["id"] === "mapcomplete-changes")[0])
            const rendering = (<PointRenderingConfigJson>protolayer.mapRendering[0])
            rendering.icon["mappings"] = iconsPerTheme
            writeFileSync('./assets/themes/mapcomplete-changes/mapcomplete-changes.json', JSON.stringify(proto, null, "  "))
        }

        this.checkAllSvgs()
    }

    private buildLayerIndex(knownImagePaths: Set<string>): Map<string, LayerConfigJson> {
        // First, we expand and validate all builtin layers. These are written to assets/generated/layers
        // At the same time, an index of available layers is built.
        console.log("   ---------- VALIDATING BUILTIN LAYERS ---------")

        const sharedTagRenderings = this.getSharedTagRenderings();
        const layerFiles = ScriptUtils.getLayerFiles();
        const sharedLayers = new Map<string, LayerConfigJson>()
        const state: DesugaringContext = {
            tagRenderings: sharedTagRenderings,
            sharedLayers
        }
        const prepLayer = new PrepareLayer(state);
        for (const sharedLayerJson of layerFiles) {
            const context = "While building builtin layer " + sharedLayerJson.path
            const fixed = prepLayer.convertStrict(sharedLayerJson.parsed, context)
            const validator = new ValidateLayer(sharedLayerJson.path, true);
            validator.convertStrict(fixed, context)

            if (sharedLayers.has(fixed.id)) {
                throw "There are multiple layers with the id " + fixed.id
            }

            sharedLayers.set(fixed.id, fixed)

            this.writeLayer(fixed)

        }
        return sharedLayers;
    }

    private buildThemeIndex(knownImagePaths: Set<string>, sharedLayers: Map<string, LayerConfigJson>): Map<string, LayoutConfigJson> {
        console.log("   ---------- VALIDATING BUILTIN THEMES ---------")
        const themeFiles = ScriptUtils.getThemeFiles();
        const fixed = new Map<string, LayoutConfigJson>();

        const convertState: DesugaringContext = {
            sharedLayers,
            tagRenderings: this.getSharedTagRenderings()
        }
        for (const themeInfo of themeFiles) {
            let themeFile = themeInfo.parsed
            const themePath = themeInfo.path

            new PrevalidateTheme().convertStrict(themeFile, themePath)
            themeFile = new PrepareTheme(convertState).convertStrict(themeFile, themePath)

            if(knownImagePaths === undefined){
                throw "Could not load known images/licenses"
            }
            new ValidateThemeAndLayers(knownImagePaths, themePath, true, convertState.tagRenderings)
                .convertStrict(themeFile, themePath)

            this.writeTheme(themeFile)
            fixed.set(themeFile.id, themeFile)
        }

        this.writeSmallOverview(themeFiles.map(tf => {
            const t = tf.parsed;
            return {
                ...t,
                hideFromOverview: t.hideFromOverview ?? false,
                shortDescription: t.shortDescription ?? new Translation(t.description).FirstSentence().translations,
                mustHaveLanguage: t.mustHaveLanguage?.length > 0
            }
        }));
        return fixed;

    }
}

new LayerOverviewUtils().main(process.argv)
