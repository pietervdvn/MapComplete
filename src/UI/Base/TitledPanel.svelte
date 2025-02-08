<div class="flex h-full flex-col">
  <div class="low-interaction flex items-center justify-between p-4 drop-shadow-md">

    <div class="flex gap-x-2">
      <slot name="title-start" />
      <h2 class="m-0">
        <slot name="title" />
      </h2>
    </div>
    <slot name="title-end" />
  </div>

  <div class="flex h-full flex-col overflow-auto border-b-2 p-4">
    <slot />
  </div>

  <slot class="mt-1 border-t-gray-300" name="footer" />
</div>
