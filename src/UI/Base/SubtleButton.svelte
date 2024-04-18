<script lang="ts">
  import { twMerge } from "tailwind-merge"

  export let options: {
    imgSize?: string
    extraClasses?: string
  } = {}
</script>

<button class={twMerge(options.extraClasses, "secondary no-image-background")} on:click>
  <slot name="image" />
  <slot name="message" />
</button>
