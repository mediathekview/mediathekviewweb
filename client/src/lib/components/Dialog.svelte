<script lang="ts">
  import type { Snippet } from 'svelte';
  import Icon from './Icon.svelte';

  interface Props {
    children: Snippet; // Main content
    header?: Snippet;
    title?: string;
    onclose?: () => void;
    class?: string;
  }

  let { children, header, title, onclose, class: extraClass = '' }: Props = $props();
  let dialog: HTMLDialogElement;

  export function show() {
    dialog.showModal();
  }
  export function close() {
    dialog.close();
  }
</script>

<dialog bind:this={dialog} class="dialog-panel {extraClass}">
  {#if header || title}
    <div class="dialog-header">
      {#if header}
        {@render header()}
      {:else if title}
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">{title}</h2>
        {#if onclose}
          <button onclick={onclose} class="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white" aria-label="Close">
            <Icon icon="x-lg" />
          </button>
        {/if}
      {/if}
    </div>
  {/if}
  <div class="p-6 md:p-8">
    {@render children()}
  </div>
</dialog>

<style>
  @reference "../../app.css";

  .dialog-panel {
    @apply m-auto w-full max-w-lg rounded-2xl bg-white p-0 shadow-lg backdrop:bg-black/50 dark:bg-slate-800;
  }
  .dialog-header {
    @apply flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-700;
  }
</style>
