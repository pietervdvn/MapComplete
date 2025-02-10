import Test from "./UI/Test.svelte"
import { OsmConnection } from "./Logic/Osm/OsmConnection"

new OsmConnection().interact("user/details.json").then((r) => console.log(">>>", r))
