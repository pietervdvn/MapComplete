<script lang="ts">
  import type { OsmTags } from "../../Models/OsmFeature"
  import Svg from "../../Svg"
  import ToSvelte from "../Base/ToSvelte.svelte"
  import { Utils } from "../../Utils"
  import { Store } from "../../Logic/UIEventSource"
  import Envelope from "../../assets/svg/Envelope.svelte"

  export let tags: Store<OsmTags>
  export let args: string[]

  let [to, subject, body, button_text] = args.map((a) => Utils.SubstituteKeys(a, $tags))
  let url =
    "mailto:" + to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body)
</script>

<a class="button flex w-full items-center" href={url} style="margin-left: 0">
  <Envelope class="mr-4 h-8 w-8 shrink-0" />
  {button_text}
</a>
