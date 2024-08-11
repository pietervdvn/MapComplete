import { Each, Fuse, On } from "./Conversion"
import { TagRenderingConfigJson } from "../Json/TagRenderingConfigJson"
import { LayerConfigJson } from "../Json/LayerConfigJson"
import { DetectMappingsWithImages } from "./DetectMappingsWithImages"
import {
    DetectConflictingAddExtraTags,
    DetectMappingsShadowedByCondition,
    DetectShadowedMappings,
    DoesImageExist,
    ValidatePossibleLinks,
} from "./Validation"
import { MiscTagRenderingChecks } from "./MiscTagRenderingChecks"

export class ValidateTagRenderings extends Fuse<TagRenderingConfigJson> {
    constructor(layerConfig?: LayerConfigJson, doesImageExist?: DoesImageExist) {
        super(
            "Various validation on tagRenderingConfigs",
            new MiscTagRenderingChecks(layerConfig),
            new DetectShadowedMappings(layerConfig),

            new DetectMappingsShadowedByCondition(),
            new DetectConflictingAddExtraTags(),
            // TODO enable   new DetectNonErasedKeysInMappings(),
            new DetectMappingsWithImages(doesImageExist),
            new On("render", new ValidatePossibleLinks()),
            new On("question", new ValidatePossibleLinks()),
            new On("questionHint", new ValidatePossibleLinks()),
            new On("mappings", new Each(new On("then", new ValidatePossibleLinks()))),
            new MiscTagRenderingChecks(layerConfig),
        )
    }
}
