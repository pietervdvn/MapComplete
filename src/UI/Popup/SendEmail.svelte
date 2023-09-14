<script lang="ts">
  
  import type { OsmTags } from "../../Models/OsmFeature";
  import Svg from "../../Svg";
  import ToSvelte from "../Base/ToSvelte.svelte";
  import { Utils } from "../../Utils";

  export let tags: Store<OsmTags>
  export let args: string[]

  let [to, subject, body, button_text] = args.map(a => Utils.SubstituteKeys(a, $tags))
  let url = "mailto:" +
    to +
    "?subject=" +
    encodeURIComponent(subject) +
    "&body=" +
    encodeURIComponent(body)
  $: console.log(url)
  console.log(">>> args", args)
</script>
<a class="button flex items-center w-full" href={url}>
  <ToSvelte construct={Svg.envelope_svg().SetClass("w-8 h-8 mr-4 shrink-0")}/>
  {button_text}
</a>
SEND EMAIL to {to} 
<br/>
subject: {subject}
<br/>
body: {body}
<br/>
{button_text}
