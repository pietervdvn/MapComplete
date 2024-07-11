<script lang="ts">/**
 *
 Wrapper around 'WikidataInput.svelte' which handles the arguments
 */

import { UIEventSource } from "../../Logic/UIEventSource"
import Locale from "../i18n/Locale"
import { Utils } from "../../Utils"
import Wikidata from "../../Logic/Web/Wikidata"
import WikidataInput from "./Helpers/WikidataInput.svelte"
import type { Feature } from "geojson"
import { onDestroy } from "svelte"
import WikidataValidator from "./Validators/WikidataValidator"

export let args: (string | number | boolean)[] = []
export let feature: Feature

export let value: UIEventSource<string>

let searchKey: string = <string>args[0] ?? "name"

let searchFor: string =
  searchKey
    .split(";")
    .map((k) => feature?.properties[k]?.toLowerCase())
    .find((foundValue) => !!foundValue) ?? ""

const options: any = args[1]
console.log(">>>", args)

let searchForValue: UIEventSource<string> = new UIEventSource(searchFor)

onDestroy(
  Locale.language.addCallbackAndRunD(lg => {
    console.log(options)
    if (searchFor !== undefined && options !== undefined) {
      const post = options["removePostfixes"] ?? []
      const pre = options["removePrefixes"] ?? []
      const clipped = WikidataValidator.removePostAndPrefixes(searchFor, pre, post, lg)
      console.log("Got clipped value:", clipped, post, pre)
      searchForValue.setData(clipped)
    }
  })
)


let instanceOf: number[] = Utils.NoNull(
  (options?.instanceOf ?? []).map((i) => Wikidata.QIdToNumber(i))
)
let notInstanceOf: number[] = Utils.NoNull(
  (options?.notInstanceOf ?? []).map((i) => Wikidata.QIdToNumber(i))
)

let allowMultipleArg = options?.["multiple"]
let allowMultiple = allowMultipleArg === "yes" || (""+allowMultipleArg) === "true"
</script>

<WikidataInput searchValue={searchForValue} {value} {instanceOf} {notInstanceOf} {allowMultiple}/>
