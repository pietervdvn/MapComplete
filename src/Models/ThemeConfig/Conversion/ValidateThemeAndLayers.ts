import { Bypass, Each, Fuse, On } from "./Conversion"
import { ThemeConfigJson } from "../Json/ThemeConfigJson"
import Constants from "../../Constants"
import { DoesImageExist, ValidateLayerConfig } from "./Validation"
import { ValidateTheme } from "./ValidateTheme"

export class ValidateThemeAndLayers extends Fuse<ThemeConfigJson> {
    constructor(
        doesImageExist: DoesImageExist,
        path: string,
        isBuiltin: boolean,
        sharedTagRenderings?: Set<string>
    ) {
        super(
            "Validates a theme and the contained layers",
            new ValidateTheme(doesImageExist, path, isBuiltin, sharedTagRenderings),
            new On(
                "layers",
                new Each(
                    new Bypass(
                        (layer) => Constants.added_by_default.indexOf(<any>layer.id) < 0,
                        new ValidateLayerConfig(undefined, isBuiltin, doesImageExist, false, true)
                    )
                )
            )
        )
    }
}
