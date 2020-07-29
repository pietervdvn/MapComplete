import { And, Tag, Or } from "./Logic/TagsFilter";
import { Overpass } from "./Logic/Overpass";


function anyValueExcept(key: string, exceptValue: string) {
    return new And([
        new Tag(key, "*"),
        new Tag(key, exceptValue, true)
    ])
}

const sellsBikes = new Tag("service:bicycle:retail", "yes")
const repairsBikes = anyValueExcept("service:bicycle:repair", "no")
const rentsBikes = new Tag("service:bicycle:rental", "yes")
const hasPump = new Tag("service:bicycle:pump", "yes")
const hasDiy = new Tag("service:bicycle:diy", "yes")
const sellsSecondHand = anyValueExcept("service:bicycle:repair", "no")
const hasBikeServices = new Or([
    sellsBikes,
    repairsBikes,
    rentsBikes,
    hasPump,
    hasDiy,
    sellsSecondHand
])

const overpassFilter = new And([
    new Tag("shop", "bicycle", true),
    hasBikeServices
])

const overpass = new Overpass(overpassFilter)

// console.log(overpass.buildQuery('bbox:51.12246976163816,3.1045767593383795,51.289518504257174,3.2848313522338866'))

console.log(overpassFilter.asOverpass())
