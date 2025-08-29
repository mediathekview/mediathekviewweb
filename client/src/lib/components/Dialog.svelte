<script lang="ts">
  import type { Snippet } from 'svelte';
  import Icon from './Icon.svelte';

  interface Props {
    children: Snippet; // Main content
    header?: Snippet;
    title?: string;
    icon?: string;
    limitWidth?: boolean;
    onclose?: () => void;
    class?: string;
  }

  let { children, header, title, icon, onclose, class: extraClass = '', limitWidth = true }: Props = $props();
  let dialog: HTMLDialogElement;

  export function show() {
    dialog.showModal();
  }
  export function close() {
    dialog.close();
  }
</script>

<dialog bind:this={dialog} class:max-w-xl={limitWidth} class:md:max-w-2xl={limitWidth} class="m-auto w-full rounded-2xl bg-white p-0 shadow-lg backdrop:bg-black/50 dark:bg-gray-800 text-gray-900 dark:text-gray-50 {extraClass}">
  {#if header || title}
    <div class="flex items-center justify-between p-6 md:p-8">
      {#if title}
        <div class="flex items-center gap-4">
          {#if icon}
            <Icon {icon} class="text-2xl " />
          {/if}
          <h1 class="text-2xl font-semibold">{title}</h1>
        </div>

        {#if onclose}
          <button onclick={onclose} class="text-gray-500 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-50 cursor-pointer" aria-label="Close">
            <Icon icon="x-lg" size="lg" />
          </button>
        {/if}
      {/if}
    </div>
  {/if}
  <div class="p-6 md:p-8 pt-0 md:pt-0">
    {@render children()}
  </div>
</dialog>

<style>
  @reference "../../app.css";
</style>
