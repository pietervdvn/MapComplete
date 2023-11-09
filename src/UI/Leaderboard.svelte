<script lang="ts">
  import { Utils } from "../Utils"
  import { Store, UIEventSource } from "../Logic/UIEventSource"
  import Loading from "./Base/Loading.svelte"
  import { OsmConnection } from "../Logic/Osm/OsmConnection"

  const osmConnection = new OsmConnection({
    attemptLogin: true,
  })
  let loggedInContributor: Store<string> = osmConnection.userDetails.map((ud) => ud.name)
  export let source =
    "https://raw.githubusercontent.com/pietervdvn/MapComplete-data/main/picture-leaderboard.json"
  let data: Store<
    | undefined
    | {
        leaderboard: {
          rank: number
          name: string
          account: string
          nrOfImages: number
        }[]
        median: number
        totalAuthors: number
        byLicense: {
          license: string
          total: number
          authors: string[]
        }
        date: string
      }
  > = UIEventSource.FromPromise(Utils.downloadJsonCached(source))
</script>

<h1>Contributed images with MapComplete: leaderboard</h1>

{#if $data}
  <table>
    <tr>
      <th>Rank</th>
      <th>Contributor</th>
      <th>Number of images contributed</th>
    </tr>
    {#each $data.leaderboard as contributor}
      <tr>
        <td>
          {contributor.rank}
        </td>
        <td>
          {#if $loggedInContributor === contributor.name}
            <a class="thanks" href={contributor.account}>{contributor.name}</a>
          {:else}
            <a href={contributor.account}>{contributor.name}</a>
          {/if}
        </td>
        <td>
          <b>{contributor.nrOfImages}</b>
          total images
        </td>
      </tr>
    {/each}
  </table>
  Statistics generated on {$data.date}
{:else}
  <Loading />
{/if}

<div>
  Logged in as {$loggedInContributor}
</div>
