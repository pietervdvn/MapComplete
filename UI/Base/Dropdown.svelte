<script lang="ts">
  import { UIEventSource } from "../../Logic/UIEventSource.js";

  /**
   * For some stupid reason, it is very hard to bind inputs
   */
  export let value: UIEventSource<number>;
  let i: number = value.data;
  $: value.setData(i)
  
</script>

<select bind:value={i} >
  <slot></slot>
</select>
