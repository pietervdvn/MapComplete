import { SpecialVisualizationSvelte } from "../SpecialVisualization"
import Maproulette from "../../Logic/Maproulette"
import SvelteUIElement from "../Base/SvelteUIElement"
import MaprouletteSetStatus from "../MapRoulette/MaprouletteSetStatus.svelte"

export class MapRouletteSpecialVisualisations {
  public static initList(): SpecialVisualizationSvelte[] {
    return [
      {
        funcName: "maproulette_set_status",
        group: "maproulette",
        docs: "Change the status of the given MapRoulette task",
        needsUrls: [Maproulette.defaultEndpoint],
        example:
          " The following example sets the status to '2' (false positive)\n" +
          "\n" +
          "```json\n" +
          "{\n" +
          "   \"id\": \"mark_duplicate\",\n" +
          "   \"render\": {\n" +
          "      \"special\": {\n" +
          "         \"type\": \"maproulette_set_status\",\n" +
          "         \"message\": {\n" +
          "            \"en\": \"Mark as not found or false positive\"\n" +
          "         },\n" +
          "         \"status\": \"2\",\n" +
          "         \"image\": \"close\"\n" +
          "      }\n" +
          "   }\n" +
          "}\n" +
          "```",
        args: [
          {
            name: "message",
            doc: "A message to show to the user"
          },
          {
            name: "image",
            doc: "Image to show",
            defaultValue: "confirm"
          },
          {
            name: "message_confirm",
            doc: "What to show when the task is closed, either by the user or was already closed."
          },
          {
            name: "status",
            doc: "A statuscode to apply when the button is clicked. 1 = `close`, 2 = `false_positive`, 3 = `skip`, 4 = `deleted`, 5 = `already fixed` (on the map, e.g. for duplicates), 6 = `too hard`",
            defaultValue: "1"
          },
          {
            name: "maproulette_id",
            doc: "The property name containing the maproulette id",
            defaultValue: "mr_taskId"
          },
          {
            name: "ask_feedback",
            doc: "If not an empty string, this will be used as question to ask some additional feedback. A text field will be added",
            defaultValue: ""
          }
        ],

        constr: (state, tagsSource, args) => {
          let [
            message,
            image,
            message_closed,
            statusToSet,
            maproulette_id_key,
            askFeedback
          ] = args
          if (image === "") {
            image = "confirm"
          }
          if (maproulette_id_key === "" || maproulette_id_key === undefined) {
            maproulette_id_key = "mr_taskId"
          }
          statusToSet = statusToSet ?? "1"
          return new SvelteUIElement(MaprouletteSetStatus, {
            state,
            tags: tagsSource,
            message,
            image,
            message_closed,
            statusToSet,
            maproulette_id_key,
            askFeedback
          })
        }
      }]
  }
}
