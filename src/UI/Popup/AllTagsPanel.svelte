<script lang="ts">
  import ToSvelte from "../Base/ToSvelte.svelte"
  import Table from "../Base/Table"
  import { UIEventSource } from "../../Logic/UIEventSource"
  import SimpleMetaTaggers from "../../Logic/SimpleMetaTagger"
  import { FixedUiElement } from "../Base/FixedUiElement"
  import { onDestroy } from "svelte"
  import Toggle from "../Input/Toggle"
  import Lazy from "../Base/Lazy"
  import BaseUIElement from "../BaseUIElement"
  import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig"
  import { VariableUiElement } from "../Base/VariableUIElement";

  //Svelte props
  export let tags: UIEventSource<any>
  export let state: { layoutToUse: LayoutConfig } = undefined

  const calculatedTags = [].concat(
    ...(state?.layoutToUse?.layers?.map((l) => l.calculatedTags?.map((c) => c[0]) ?? []) ?? [])
  )

  const allTags = tags.map((tags) => {
    const parts: (string | BaseUIElement)[][] = []
    for (const key in tags) {
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

    for (const metatag of SimpleMetaTaggers.metatags.filter((mt) => mt.isLazy)) {
      const title = "<i>" + metatag.keys.join(";") + "</i> (lazy)"
      const toggleState = new UIEventSource(false)
      const toggle: BaseUIElement = new Toggle(
        new Lazy(() => new FixedUiElement(metatag.keys.map((key) => tags[key]).join(";"))),
        new FixedUiElement("Evaluate").onClick(() => toggleState.setData(true)),
        toggleState
      )
      parts.push([title, toggle])
    }

    return parts
  })

  const tagsTable = new VariableUiElement(allTags.mapD(_allTags => new Table(["Key", "Value"], _allTags).SetClass("zebra-table break-all")))
</script>

<section>
  <ToSvelte construct={tagsTable} />
</section>
