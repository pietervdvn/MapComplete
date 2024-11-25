<script lang="ts">
  import LoginToggle from "../../Base/LoginToggle.svelte"
  import type { SpecialVisualizationState } from "../../SpecialVisualization"
  import Translations from "../../i18n/Translations"
  import Tr from "../../Base/Tr.svelte"
  import { TrashIcon } from "@babeard/svelte-heroicons/mini"
  import type { OsmId, OsmTags } from "../../../Models/OsmFeature"
  import DeleteConfig from "../../../Models/ThemeConfig/DeleteConfig"
  import TagRenderingQuestion from "../TagRendering/TagRenderingQuestion.svelte"
  import type { Feature } from "geojson"
  import { UIEventSource } from "../../../Logic/UIEventSource"
  import LayerConfig from "../../../Models/ThemeConfig/LayerConfig"
  import { TagUtils } from "../../../Logic/Tags/TagUtils"
  import type { UploadableTag } from "../../../Logic/Tags/TagUtils"
  import OsmChangeAction from "../../../Logic/Osm/Actions/OsmChangeAction"
  import DeleteAction from "../../../Logic/Osm/Actions/DeleteAction"
  import ChangeTagAction from "../../../Logic/Osm/Actions/ChangeTagAction"
  import Loading from "../../Base/Loading.svelte"
  import { DeleteFlowState } from "./DeleteFlowState"
  import { twJoin } from "tailwind-merge"
  import AccordionSingle from "../../Flowbite/AccordionSingle.svelte"
  import Trash from "@babeard/svelte-heroicons/mini/Trash"
  import Invalid from "../../../assets/svg/Invalid.svelte"
  import { And } from "../../../Logic/Tags/And"

  export let state: SpecialVisualizationState
  export let deleteConfig: DeleteConfig

  export let tags: UIEventSource<OsmTags>

  let featureId: OsmId = <OsmId>tags.data.id

  export let feature: Feature
  export let layer: LayerConfig

  const deleteAbility = new DeleteFlowState(featureId, state, deleteConfig.neededChangesets)

  const canBeDeleted: UIEventSource<boolean | undefined> = deleteAbility.canBeDeleted
  const canBeDeletedReason = deleteAbility.canBeDeletedReason

  const hasSoftDeletion = deleteConfig.softDeletionTags !== undefined
  let currentState: "confirm" | "applying" | "deleted" = "confirm"
  $: {
    deleteAbility.CheckDeleteability(true)
  }

  const t = Translations.t.delete

  let selectedTags: UploadableTag
  let changedProperties = undefined
  $: changedProperties = TagUtils.changeAsProperties(selectedTags?.asChange(tags?.data ?? {}) ?? [])
  let isHardDelete = undefined
  $: isHardDelete = changedProperties[DeleteConfig.deleteReasonKey] !== undefined

  async function onDelete() {
    if (selectedTags === undefined) {
      return
    }
    currentState = "applying"
    let actionToTake: OsmChangeAction
    const changedProperties = TagUtils.changeAsProperties(selectedTags.asChange(tags?.data ?? {}))
    const deleteReason = changedProperties[DeleteConfig.deleteReasonKey]
    if (deleteReason) {
      const softDeletionTags=  new And([deleteConfig.softDeletionTags,
        ...layer.tagRenderings.flatMap(tr => tr.onSoftDelete ?? [])
      ])

      // This is a proper, hard deletion
      actionToTake = new DeleteAction(
        featureId,
        softDeletionTags,
        {
          theme: state?.theme?.id ?? "unknown",
          specialMotivation: deleteReason,
        },
        canBeDeleted.data
      )
    } else {
      // no _delete_reason is given, which implies that this is _not_ a deletion but merely a retagging via a nonDeleteMapping
      actionToTake = new ChangeTagAction(featureId, selectedTags, tags.data, {
        theme: state?.theme?.id ?? "unkown",
        changeType: "special-delete",
      })
    }

    await state.changes?.applyAction(actionToTake)
    tags.data["_deleted"] = "yes"
    tags.ping()
    currentState = "deleted"
  }
</script>

<LoginToggle ignoreLoading={true} {state}>
  {#if $canBeDeleted === false && !hasSoftDeletion}
    <div class="low-interaction subtle flex gap-x-1 rounded p-2 text-sm italic">
      <div class="relative h-fit">
        <Trash class="h-8 w-8 pb-1" />
        <Invalid class="absolute bottom-0 right-0 h-5 w-5" />
      </div>
      <div class="flex flex-col">
        <Tr t={t.cannotBeDeleted} />
        <Tr t={$canBeDeletedReason} />
        <Tr t={t.useSomethingElse} />
      </div>
    </div>
  {:else}
    <AccordionSingle>
      <span slot="header" class="flex">
        <TrashIcon class="h-6 w-6" />
        <Tr t={t.delete} />
      </span>
      <span>
        {#if currentState === "confirm"}
          <TagRenderingQuestion
            bind:selectedTags
            clss=""
            {tags}
            config={deleteConfig.constructTagRendering()}
            {state}
            selectedElement={feature}
            {layer}
          >
            <button
              slot="save-button"
              on:click={onDelete}
              class={twJoin(
                selectedTags === undefined && "disabled",
                "primary flex items-center bg-red-600"
              )}
            >
              <TrashIcon
                class={twJoin(
                  "ml-1 mr-2 h-6 w-6 rounded-full p-1",
                  selectedTags !== undefined && "bg-red-600"
                )}
              />
              <Tr t={t.delete} />
            </button>

            <div slot="under-buttons" class="subtle italic">
              {#if selectedTags !== undefined}
                {#if canBeDeleted && isHardDelete}
                  <!-- This is a hard delete - explain that this is a hard delete...-->
                  <Tr t={t.explanations.hardDelete} />
                {:else}
                  <!-- This is a soft deletion: we explain _why_ the deletion is soft -->
                  <Tr t={t.explanations.softDelete.Subs({ reason: $canBeDeletedReason })} />
                {/if}
              {/if}
            </div>
          </TagRenderingQuestion>
        {:else if currentState === "applying"}
          <Loading />
        {:else}
          <!-- currentState === 'deleted' -->

          <div class="low-interaction flex">
            <TrashIcon class="h-6 w-6" />
            <Tr t={t.isDeleted} />
          </div>
        {/if}
      </span>
    </AccordionSingle>
  {/if}
</LoginToggle>
