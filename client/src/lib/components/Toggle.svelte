<script lang="ts">
  interface Props extends svelte.elements.HTMLInputAttributes {
    label: string;
    checked?: boolean;
  }

  let { label, checked = $bindable(), class: extraClass = '', ...rest }: Props = $props();

  const id = `toggle-${crypto.randomUUID()}`;
</script>

<div class="flex items-center gap-2 {extraClass}">
  <!-- The label for the toggle -->
  <label for={id} class="cursor-pointer select-none text-sm font-medium text-gray-900 dark:text-gray-300">{label}</label>

  <!-- The toggle switch -->
  <div class="group relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-blue-500 dark:has-focus-visible:outline-blue-500">
    <!-- Background -->
    <span class="absolute mx-auto h-4 w-9 rounded-full bg-gray-200 transition-colors duration-200 ease-in-out group-has-checked:bg-blue-600 dark:bg-gray-700 dark:group-has-checked:bg-blue-500"></span>
    <!-- Knob -->
    <span class="absolute left-0 size-5 rounded-full border border-gray-300 bg-white shadow-sm transition-transform duration-200 ease-in-out group-has-checked:translate-x-5 dark:border-gray-500 dark:bg-gray-300 dark:shadow-none"></span>
    <input type="checkbox" bind:checked {id} name={label} class="absolute inset-0 w-full h-full opacity-0 cursor-pointer appearance-none rounded-full focus:outline-hidden" aria-label={label} {...rest} />
  </div>
</div>
