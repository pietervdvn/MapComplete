<script lang="ts">
  /**
   * Constructs an input helper element for the given type.
   * Note that all values are stringified
   */
  
  import { AvailableInputHelperType } from "./InputHelpers";
  import { UIEventSource } from "../../Logic/UIEventSource";

  export let type : AvailableInputHelperType
  export let value : UIEventSource<string>
  
</script>
