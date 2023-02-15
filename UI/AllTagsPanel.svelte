<script lang="ts">
  import ToSvelte from "./Base/ToSvelte.svelte"
  import Table from "./Base/Table"
  import { UIEventSource } from "../Logic/UIEventSource"

  //Svelte props
  export let tags: UIEventSource<any>
  export let state: any

  const calculatedTags = [].concat(
    // SimpleMetaTagger.lazyTags,
    ...(state?.layoutToUse?.layers?.map((l) => l.calculatedTags?.map((c) => c[0]) ?? []) ?? [])
  )

  const allTags = tags.map((tags) => {
    const parts = []
    for (const key in tags) {
      if (!tags.hasOwnProperty(key)) {
        continue
      }
      let v = tags[key]
      if (v === "") {
        v = "<b>empty string</b>"
      }
      parts.push([key, v ?? "<b>undefined</b>"])
    }

    for (const key of calculatedTags) {
      const value = tags[key]
      if (value === undefined) {
        continue
      }
      let type = ""
      if (typeof value !== "string") {
        type = " <i>" + typeof value + "</i>"
      }
      parts.push(["<i>" + key + "</i>", value])
    }

    return parts
  })

  const tagsTable = new Table(["Key", "Value"], $allTags).SetClass("zebra-table")
</script>

<section>
  <ToSvelte construct={tagsTable} />
</section>

<style lang="scss">
  section {
    @apply border border-solid border-black rounded-2xl p-4 block;
  }
</style>
