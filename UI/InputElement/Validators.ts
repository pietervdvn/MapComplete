import { Validator } from "./Validator"
import StringValidator from "./Validators/StringValidator"
import TextValidator from "./Validators/TextValidator"
import DateValidator from "./Validators/DateValidator"
import NatValidator from "./Validators/NatValidator"
import IntValidator from "./Validators/IntValidator"
import LengthValidator from "./Validators/LengthValidator"
import DirectionValidator from "./Validators/DirectionValidator"
import WikidataValidator from "./Validators/WikidataValidator"
import PNatValidator from "./Validators/PNatValidator"
import FloatValidator from "./Validators/FloatValidator"
import PFloatValidator from "./Validators/PFloatValidator"
import EmailValidator from "./Validators/EmailValidator"
import UrlValidator from "./Validators/UrlValidator"
import PhoneValidator from "./Validators/PhoneValidator"
import OpeningHoursValidator from "./Validators/OpeningHoursValidator"
import ColorValidator from "./Validators/ColorValidator"
import BaseUIElement from "../BaseUIElement"
import Combine from "../Base/Combine"
import Title from "../Base/Title"

export default class Validators {
    private static readonly AllValidators: ReadonlyArray<Validator> = [
        new StringValidator(),
        new TextValidator(),
        new DateValidator(),
        new NatValidator(),
        new IntValidator(),
        new LengthValidator(),
        new DirectionValidator(),
        new WikidataValidator(),
        new PNatValidator(),
        new FloatValidator(),
        new PFloatValidator(),
        new EmailValidator(),
        new UrlValidator(),
        new PhoneValidator(),
        new OpeningHoursValidator(),
        new ColorValidator(),
    ]
    public static allTypes: Map<string, Validator> = Validators.allTypesDict()

    public static HelpText(): BaseUIElement {
        const explanations: BaseUIElement[] = Validators.AllValidators.map((type) =>
            new Combine([new Title(type.name, 3), type.explanation]).SetClass("flex flex-col")
        )
        return new Combine([
            new Title("Available types for text fields", 1),
            "The listed types here trigger a special input element. Use them in `tagrendering.freeform.type` of your tagrendering to activate them",
            ...explanations,
        ]).SetClass("flex flex-col")
    }

    public static AvailableTypes(): string[] {
        return Validators.AllValidators.map((tp) => tp.name)
    }

    private static allTypesDict(): Map<string, Validator> {
        const types = new Map<string, Validator>()
        for (const tp of Validators.AllValidators) {
            types.set(tp.name, tp)
        }
        return types
    }
}
