import { Validator } from "../Validator"

export default class LengthValidator extends Validator {
    constructor() {
        super(
            "distance",
            'A geographical distance in meters (rounded at two points). Will give an extra minimap with a measurement tool. Arguments: [ zoomlevel, preferredBackgroundMapType (comma separated) ], e.g. `["21", "map,photo"]',
            "decimal"
        )
    }

    isValid = (str) => {
        const t = Number(str)
        return !isNaN(t)
    }
}
