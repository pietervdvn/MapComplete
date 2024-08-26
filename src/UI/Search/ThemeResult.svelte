<script lang="ts">
  import { MinimalLayoutInformation } from "../../Models/ThemeConfig/LayoutConfig"
  import MoreScreen from "../BigComponents/MoreScreen"
  import { Translation } from "../i18n/Translation"
  import Icon from "../Map/Icon.svelte"
  import Tr from "../Base/Tr.svelte"

  export let entry:  { category: "theme", payload: MinimalLayoutInformation }
  let otherTheme = entry.payload
</script>

<a href={MoreScreen.createUrlFor(otherTheme, false)}
   class="flex items-center p-2 w-full gap-y-2 rounded-xl searchresult">

  <Icon icon={otherTheme.icon} clss="w-6 h-6 m-1" />
  <div class="flex flex-col">
    <b>
      <Tr t={new Translation(otherTheme.title)} />
    </b>
    <!--<Tr t={new Translation(otherTheme.shortDescription)} /> -->
  </div>
</a>
