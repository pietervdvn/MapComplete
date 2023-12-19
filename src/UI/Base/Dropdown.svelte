<script lang="ts">
  import { UIEventSource } from "../../Logic/UIEventSource.js"

  export let value: UIEventSource<any>
  let htmlElement: HTMLSelectElement
  function selectAppropriateValue() {
    if (!htmlElement) {
      return
    }
    const v = value.data
    for (let option of htmlElement.getElementsByTagName("option")) {
      if (option.value === v) {
        option.selected = true
        return
      }
    }
  }

  value.addCallbackD(() => selectAppropriateValue())
  $: {
    if (htmlElement) {
      selectAppropriateValue()
    }
  }
  export let cls: string = undefined
</script>

<select
  class={cls}
  bind:this={htmlElement}
  on:change={(e) => {
    value.setData(e.srcElement.value)
  }}
>
  <slot />
</select>
