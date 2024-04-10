<script lang="ts">
  import { ImmutableStore, Store } from "../../Logic/UIEventSource"

  export let text: Store<string>
  export let href: Store<string>
  export let classnames: Store<string> = undefined
  export let download: Store<string> = undefined
  export let ariaLabel: Store<string> = undefined

  export let newTab: Store<boolean> = new ImmutableStore(false)
</script>

<a
  href={$href}
  aria-label={$ariaLabel}
  title={$ariaLabel}
  target={$newTab ? "_blank" : undefined}
  download={$download}
  class={$classnames}
>
  {@html $text}
</a>
