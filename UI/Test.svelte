<script lang="ts">
  // Testing grounds
  import { UIEventSource } from "../Logic/UIEventSource"
  import TabbedGroup from "./Base/TabbedGroup.svelte"

  let tab = new UIEventSource(1)
  console.log("Tab control", tab)
</script>

<TabbedGroup {tab}>
  <div slot="title0">Title 0</div>
  <div slot="content0">Content 0 loaded</div>

  <div slot="title1">Title 1</div>
  <div slot="content1">Content 1</div>
</TabbedGroup>
