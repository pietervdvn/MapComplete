<script lang="ts">
import OHTable from "./InputElement/Helpers/OpeningHours/OHTable.svelte"
import { UIEventSource } from "../Logic/UIEventSource"
import type { OpeningHour } from "./OpeningHours/OpeningHours"
export let value: UIEventSource<OpeningHour[]> = new UIEventSource<OpeningHour[]>([
  {
    weekday: 3,
    startMinutes: 0,
    endMinutes: 0,
    startHour: 12,
    endHour: 16
  },
  {
    weekday: 0,
    startMinutes: 0,
    endMinutes: 0,
    startHour: 0,
    endHour: 24
  },
  {
    weekday: 1,
    startMinutes: 0,
    endMinutes: 0,
    startHour: 1,
    endHour: 24
  },
  {
    weekday: 2,
    startMinutes: 0,
    endMinutes: 0,
    startHour: 12,
    endHour: 24
  }
])

</script>

<main >
  <OHTable {value}/>
</main>
