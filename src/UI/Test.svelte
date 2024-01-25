<script lang="ts">
  // Testing grounds
  import LanguageElement from "./Popup/LanguageElement/LanguageElement.svelte"
  import { UIEventSource } from "../Logic/UIEventSource"

  let tags = new UIEventSource({_country: "Be"})
</script>


<LanguageElement
  feature={undefined}
  item_render={"{language()} is spoken here"}
  key="language"
  layer={undefined}
  question="What languages are spoken here?"
  render_all={"Following languages are spoken here: {list()}"} single_render={"Only {language()} is spoken here"} state={undefined} {tags} />
