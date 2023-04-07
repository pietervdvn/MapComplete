<script lang="ts">
  import { UIEventSource } from "../../../Logic/UIEventSource";
  import { Translation } from "../../i18n/Translation";
  import ValidatedInput from "../../InputElement/ValidatedInput.svelte";
  import Tr from "../../Base/Tr.svelte";
  import TagRenderingConfig from "../../../Models/ThemeConfig/TagRenderingConfig";
  import Inline from "./Inline.svelte";
  import { createEventDispatcher } from "svelte";

  export let value: UIEventSource<string>;
  export let config: TagRenderingConfig;
  export let tags: UIEventSource<Record<string, string>>;

  let feedback: UIEventSource<Translation> = new UIEventSource<Translation>(undefined);

  let dispatch = createEventDispatcher<{ "selected" }>();
</script>

{#if config.freeform.inline}
  <Inline key={config.freeform.key} {tags} template={config.render}>
    <ValidatedInput {feedback} on:selected={() => dispatch("selected")}
                    type={config.freeform.type} {value}></ValidatedInput>
  </Inline>
{:else}
  <ValidatedInput {feedback} on:selected={() => dispatch("selected")}
                  type={config.freeform.type} {value}></ValidatedInput>

{/if}


{#if $feedback !== undefined}
  <div class="alert">
    <Tr t={$feedback} />
  </div>
{/if}
