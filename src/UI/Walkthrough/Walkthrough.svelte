<script lang="ts">
  import { createEventDispatcher } from "svelte"
  import WalkthroughStep from "./WalkthroughStep.svelte"
  import FromHtml from "../Base/FromHtml.svelte"
  import Markdown from "../Base/Markdown.svelte"

  /**
   * Markdown
   */
  export let pages: string[]

  let currentPage: number = 0

  const dispatch = createEventDispatcher<{ done }>()

  function step(incr: number) {
    if (incr > 0 && currentPage + 1 === pages.length) {
      dispatch("done")
      currentPage = 0
      return
    }
    currentPage = Math.min(Math.max(0, currentPage + incr), pages.length)
  }
</script>

<WalkthroughStep
  on:back={() => step(-1)}
  on:next={() => step(1)}
  isFirst={currentPage === 0}
  islast={currentPage + 1 === pages.length}
  totalPages={pages.length}
  pageNumber={currentPage}
>
  <Markdown src={pages[currentPage]} />
</WalkthroughStep>
