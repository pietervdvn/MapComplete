<script lang="ts">
  import Loading from "../Base/Loading.svelte"
  import CheckCircle from "@babeard/svelte-heroicons/mini/CheckCircle"
  import XCircle from "@rgossiaux/svelte-heroicons/solid/XCircle"
  import { twJoin } from "tailwind-merge"
  import { XIcon } from "@rgossiaux/svelte-heroicons/outline"
  import Exclamation from "@rgossiaux/svelte-heroicons/solid/Exclamation"
  import Check from "@babeard/svelte-heroicons/mini/Check"
  import { XCircleIcon } from "@rgossiaux/svelte-heroicons/solid"

  export let status: "online" | "degraded" | "offline"
  export let cls: string = "w-6 h-6 mx-1"
</script>

{#if status === "online"}
  <CheckCircle class={twJoin(cls,"rounded-full")} style="color: #22cc22" />
{:else if status === "degraded"}
  <Exclamation class={twJoin(cls,"rounded-full")} style="color: #eecc22"  />
{:else if status === "offline"}
  <XCircleIcon class={twJoin(cls,"rounded-full")} style="color: #bb2222"  />
{:else if status === undefined}
  <Loading />
{:else}
  ? {status}
{/if}

