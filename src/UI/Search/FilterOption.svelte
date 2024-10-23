<script lang="ts">
  import type { FilterConfigOption } from "../../Models/ThemeConfig/FilterConfig"
  import Tr from "../Base/Tr.svelte"
  import Icon from "../Map/Icon.svelte"

  export let option: FilterConfigOption
</script>

<Icon icon={option.icon ?? option.emoji} clss="w-5 h-5" emojiHeight="14px" />
<Tr t={option.question} />
