<script lang="ts">
  interface Option {
    value: string | number;
    label: string;
  }

  interface Props extends svelte.elements.HTMLSelectAttributes {
    options: Option[];
    value: string | number;
    label: string;
  }

  let { options, value = $bindable(), label, class: extraClass = '', ...rest }: Props = $props();
</script>

<div class="relative {extraClass}">
  <select name={label} aria-label={label} bind:value class="appearance-none rounded-md bg-gray-200/75 py-2 pl-3 pr-8 font-medium text-gray-900 border-none cursor-pointer transition-colors duration-250 hover:bg-gray-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 sm:text-sm/6 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:*:bg-gray-800 dark:focus-visible:outline-blue-500" {...rest}>
    {#each options as option}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>
</div>
