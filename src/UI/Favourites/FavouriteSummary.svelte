<script lang="ts">

  export let properties: Record<string, string>
</script>

<div>
  {JSON.stringify(properties)}
  {properties?.id ?? "undefined"}
  <a href={properties._backend +"/"+ properties?.id}>OSM</a>
</div>
