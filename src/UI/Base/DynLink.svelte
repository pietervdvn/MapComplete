<script lang="ts">
  import { ImmutableStore, Store } from "../../Logic/UIEventSource"
  import Icon from "../Map/Icon.svelte"

  export let text: Store<string>
  export let href: Store<string>
  export let classnames: Store<string> = undefined
  export let download: Store<string> = undefined
  export let ariaLabel: Store<string> = undefined

  export let newTab: Store<boolean> = new ImmutableStore(false)
  export let icon: Store<string> = undefined
</script>

<a
  href={$href}
  aria-label={$ariaLabel}
  title={$ariaLabel}
  target={$newTab ? "_blank" : undefined}
  download={$download}
  class={$classnames}
>
  {#if $icon}
    <Icon clss="w-4 h-4" icon={$icon} />
  {/if}
  {@html $text}
</a>
