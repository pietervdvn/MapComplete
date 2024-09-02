<div class="flex h-full flex-col">
  <h2 class="low-interaction m-0 flex items-center p-4 drop-shadow-md">
    <slot name="title" />
  </h2>

  <div class="flex h-full flex-col overflow-auto border-b-2 p-4">
    <slot />
  </div>

  <slot class="mt-1 border-t-gray-300" name="footer" />
</div>
