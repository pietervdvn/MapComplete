import MangroveReviewsOfFeature, { MangroveIdentity } from "./Logic/Web/MangroveReviews"
import { Feature, Point } from "geojson"
import { OsmTags } from "./Models/OsmFeature"
import { VariableUiElement } from "./UI/Base/VariableUIElement"
import List from "./UI/Base/List"
import { UIEventSource } from "./Logic/UIEventSource"
import UserRelatedState from "./Logic/State/UserRelatedState"

const feature: Feature<Point, OsmTags> = {
    type: "Feature",
    id: "node/6739848322",
    properties: {
        "addr:city": "San Diego",
        "addr:housenumber": "2816",
        "addr:postcode": "92106",
        "addr:street": "Historic Decatur Road",
        "addr:unit": "116",
        amenity: "restaurant",
        cuisine: "burger",
        delivery: "yes",
        "diet:halal": "no",
        "diet:vegetarian": "yes",
        dog: "yes",
        image: "https://i.imgur.com/AQlGNHQ.jpg",
        internet_access: "wlan",
        "internet_access:fee": "no",
        "internet_access:ssid": "Public-stinebrewingCo",
        microbrewery: "yes",
        name: "Stone Brewing World Bistro & Gardens",
        opening_hours: "Mo-Fr, Su 11:30-21:00; Sa 11:30-22:00",
        organic: "no",
        "payment:cards": "yes",
        "payment:cash": "yes",
        "service:electricity": "ask",
        takeaway: "yes",
        website: "https://www.stonebrewing.com/visit/bistros/liberty-station",
        wheelchair: "designated",
        "_last_edit:contributor": "Drew Dowling",
        "_last_edit:timestamp": "2023-01-11T23:22:28Z",
        id: "node/6739848322",
        timestamp: "2023-01-11T23:22:28Z",
        user: "Drew Dowling",
        _backend: "https://www.openstreetmap.org",
        _lat: "32.7404614",
        _lon: "-117.211684",
        _layer: "food",
        _length: "0",
        "_length:km": "0.0",
        "_now:date": "2023-01-20",
        "_now:datetime": "2023-01-20 17:46:54",
        "_loaded:date": "2023-01-20",
        "_loaded:datetime": "2023-01-20 17:46:54",
        "_geometry:type": "Point",
        _surface: "0",
        "_surface:ha": "0",
        _country: "us",
    },
    geometry: {
        type: "Point",
        coordinates: [0, 0],
    },
}
const state = new UserRelatedState(undefined)

state.allElements.addOrGetElement(feature)

const reviews = MangroveReviewsOfFeature.construct(feature, state)

reviews.reviews.addCallbackAndRun((r) => {
    console.log("Reviews are:", r)
})
window.setTimeout(async () => {
    await reviews.createReview({
        opinion: "Cool bar",
        rating: 90,
        metadata: {
            nickname: "Pietervdvn",
        },
    })
    console.log("Submitted review")
}, 1000)

new VariableUiElement(
    reviews.reviews.map(
        (reviews) =>
            new List(
                reviews.map((r) => r.rating + "% " + r.opinion + " (" + r.metadata.nickname + ")")
            )
    )
).AttachTo("maindiv")
