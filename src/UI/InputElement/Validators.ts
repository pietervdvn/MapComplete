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
import SimpleTagValidator from "./Validators/SimpleTagValidator"
import ImageUrlValidator from "./Validators/ImageUrlValidator"
import TagKeyValidator from "./Validators/TagKeyValidator"
import TranslationValidator from "./Validators/TranslationValidator"
import FediverseValidator from "./Validators/FediverseValidator"
import IconValidator from "./Validators/IconValidator"
import TagValidator from "./Validators/TagValidator"
import IdValidator from "./Validators/IdValidator"
import SlopeValidator from "./Validators/SlopeValidator"
import VeloparkValidator from "./Validators/VeloparkValidator"
import CurrencyValidator from "./Validators/CurrencyValidator"

export type ValidatorType = (typeof Validators.availableTypes)[number]

export default class Validators {
    public static readonly availableTypes = [
        "string",
        "text",
        "date",
        "nat",
        "int",
        "distance",
        "direction",
        "wikidata",
        "pnat",
        "float",
        "pfloat",
        "email",
        "url",
        "phone",
        "opening_hours",
        "color",
        "image",
        "simple_tag",
        "key",
        "translation",
        "icon",
        "fediverse",
        "tag",
        "fediverse",
        "id",
        "slope",
        "velopark",
        "currency"
    ] as const

    public static readonly AllValidators: ReadonlyArray<Validator> = [
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
        new ImageUrlValidator(),
        new SimpleTagValidator(),
        new TagValidator(),
        new TagKeyValidator(),
        new TranslationValidator(),
        new IconValidator(),
        new FediverseValidator(),
        new IdValidator(),
        new SlopeValidator(),
        new VeloparkValidator(),
        new CurrencyValidator()
    ]

    private static _byType = Validators._byTypeConstructor()

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

    private static _byTypeConstructor(): Map<ValidatorType, Validator> {
        const map = new Map<ValidatorType, Validator>()
        for (const validator of Validators.AllValidators) {
            map.set(<ValidatorType>validator.name, validator)
        }
        return map
    }

    static get(type: ValidatorType): Validator {
        return Validators._byType.get(type)
    }
}
