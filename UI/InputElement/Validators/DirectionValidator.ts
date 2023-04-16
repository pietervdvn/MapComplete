import IntValidator from "./IntValidator"

export default class DirectionValidator extends IntValidator {
    constructor() {
        super(
            "direction",
            [
                "A geographical direction, in degrees. 0° is north, 90° is east, ... Will return a value between 0 (incl) and 360 (excl).",
                "### Input helper",
                "This element has an input helper showing a map and 'viewport' indicating the direction. By default, this map is zoomed to zoomlevel 17, but this can be changed with the first argument",
            ].join("\n\n")
        )
    }

    isValid(str): boolean {
        if (str.endsWith("°")) {
            str = str.substring(0, str.length - 1)
        }
        return super.isValid(str)
    }

    reformat(str): string {
        if (str.endsWith("°")) {
            str = str.substring(0, str.length - 1)
        }
        const n = Number(str) % 360
        return "" + n
    }
}
