<div class="sidebar-unit">
  <slot />
</div>

<style>
  :global(.sidebar-unit) {
    display: flex;
    flex-direction: column;
    row-gap: 0.25rem;
    background: var(--background-color);
    padding: 0.5rem;
    border-radius: 0.5rem;
  }

  :global(.sidebar-unit > h3) {
    margin-top: 0;
    margin-bottom: 0.5rem;
    padding: 0.25rem;
  }

  :global(
      .sidebar-button svg,
      .sidebar-button img,
      .sidebar-unit > button img,
      .sidebar-unit > button svg
    ) {
    width: 1.5rem;
    height: 1.5rem;
    margin-right: 0.5rem;
    flex-shrink: 0;
  }

  :global(.sidebar-button .weblate-link > svg) {
    width: 0.75rem;
    height: 0.75rem;
    flex-shrink: 0;
  }

  :global(.sidebar-button, .sidebar-unit > a, .sidebar-unit > button) {
    display: flex;
    align-items: center;
    border-radius: 0.25rem !important;
    padding: 0.4rem 0.75rem !important;
    text-decoration: none !important;
    width: 100%;
    text-align: start;
  }

  :global(
      .sidebar-button > svg,
      .sidebar-button > img,
      .sidebar-unit > a img,
      .sidebar-unit > a svg,
      .sidebar-unit > button svg,
      .sidebar-unit > button img
    ) {
    margin-right: 0.5rem;
    flex-shrink: 0;
  }

  :global(.sidebar-button:hover, .sidebar-unit > a:hover, .sidebar-unit > button:hover) {
    background: var(--low-interaction-background) !important;
  }
</style>
