<script lang="ts">
  import { UIEventSource } from "../../Logic/UIEventSource"
  import Dropdown from "../Base/Dropdown.svelte"
  import Tr from "../Base/Tr.svelte"
  import Translations from "../i18n/Translations"
  import ToSvelte from "../Base/ToSvelte.svelte"
  import { TextField } from "../Input/TextField"
  import { OH } from "./OpeningHours"

  export let value: UIEventSource<string>
  let startValue: UIEventSource<string> = new UIEventSource<string>(undefined)
  let endValue: UIEventSource<string> = new UIEventSource<string>(undefined)

  const t = Translations.t.general.opening_hours
  let mode = new UIEventSource("")

  value
    .map((ph) => OH.ParsePHRule(ph))
    .addCallbackAndRunD((parsed) => {
      if (parsed === null) {
        return
      }
      mode.setData(parsed.mode)
      startValue.setData(parsed.start)
      endValue.setData(parsed.end)
    })

  function updateValue() {
    if (mode.data === undefined || mode.data === "") {
      // not known
      value.setData("")
    } else if (mode.data === "off") {
      value.setData("PH off")
    } else if (mode.data === "open") {
      value.setData("PH open")
    } else if (startValue.data === undefined || endValue.data === undefined) {
      // Open during PH with special hours
      // hours not filled in - not saveable
      value.setData(undefined)
    } else {
      value.setData(`PH ${startValue.data}-${endValue.data}`)
    }
  }

  startValue.addCallbackAndRunD(() => updateValue())
  endValue.addCallbackAndRunD(() => updateValue())
  mode.addCallbackAndRunD(() => updateValue())
</script>

<label>
  <Tr t={t.open_during_ph} />

  <Dropdown value={mode}>
    <option value={""}>
      <Tr t={t.ph_not_known} />
    </option>

    <option value={"off"}>
      <Tr t={t.ph_closed} />
    </option>

    <option value={"open"}>
      <Tr t={t.ph_open_as_usual} />
    </option>

    <option value={" "}>
      <!-- Yes, the value is a single space-->
      <Tr t={t.ph_open} />
    </option>
  </Dropdown>
</label>

{#if $mode === " "}
  <div class="flex">
    <Tr t={t.opensAt} />
    <ToSvelte
      construct={new TextField({
        value: startValue,
        placeholder: "starthour",
        htmlType: "time",
      }).SetClass("inline-block")}
    />
    <Tr t={t.openTill} />
    <ToSvelte
      construct={new TextField({
        value: endValue,
        placeholder: "endhour",
        htmlType: "time",
      }).SetClass("inline-block")}
    />
  </div>
{/if}
