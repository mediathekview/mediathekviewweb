<script lang="ts">
  interface Props extends svelte.elements.HTMLButtonAttributes {
    variant?: 'secondary' | 'success';
    children?: svelte.Snippet;
  }

  let { variant, children, class: extraClass = '', ...rest }: Props = $props();

  const variantClasses = $derived(
    {
      default: '',
      secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:ring-gray-500',
      success: 'bg-green-600 hover:bg-green-500 dark:bg-green-700 dark:hover:bg-green-600 text-white focus:ring-green-500',
    }[variant ?? 'default'] ?? '',
  );
</script>

<button class="btn {variantClasses} {extraClass}" {...rest}>
  {#if children}
    {@render children()}
  {/if}
</button>

<style>
  @reference "../../app.css";

  .btn {
    @apply inline-flex items-center justify-center px-4 py-2 rounded-md font-medium cursor-pointer transition-colors duration-250 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800;
  }
</style>
