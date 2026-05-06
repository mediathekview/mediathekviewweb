<script lang="ts">
  import { appState } from '$lib/store.svelte';
  import Dialog from './Dialog.svelte';
  import Icon from './Icon.svelte';

  let dialog: Dialog;
  let quality = $state<'hd' | 'sd' | 'low'>('hd');
  let size = $state(50);
  let copied = $state(false);

  const feedUrl = $derived(appState.getRssFeedUrl(quality, size));

  export function show() {
    quality = 'hd';
    size = 50;
    copied = false;
    dialog.show();
  }

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(feedUrl);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch {
      /* ignore */
    }
  }

  function openFeed() {
    window.open(feedUrl, '_blank');
  }
</script>

<Dialog bind:this={dialog} title="RSS-Feed" icon="rss" closeOnClickOutside>
  <div class="space-y-5">
    <div>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">Videoqualität für den Feed:</p>
      <div class="quality-group">
        {#each [{ value: 'hd', label: 'HD' }, { value: 'sd', label: 'SD' }, { value: 'low', label: 'Niedrig' }] as option (option.value)}
          <label class="quality-option" class:active={quality === option.value}>
            <input type="radio" name="rss-quality" value={option.value} bind:group={quality} class="sr-only" />
            {option.label}
          </label>
        {/each}
      </div>
    </div>

    <div>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">Anzahl Einträge:</p>
      <div class="quality-group">
        {#each [10, 50, 100, 250] as option (option)}
          <label class="quality-option" class:active={size === option}>
            <input type="radio" name="rss-size" value={option} bind:group={size} class="sr-only" />
            {option}
          </label>
        {/each}
      </div>
    </div>

    <div>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Feed-URL:</p>
      <div class="flex gap-2">
        <input type="text" readonly value={feedUrl} class="url-input" onclick={(e) => (e.target as HTMLInputElement)?.select()} />
        <button type="button" class="copy-btn" onclick={copyUrl} aria-label="URL kopieren">
          {#if copied}
            <Icon icon="check-lg" class="text-green-500" />
          {:else}
            <Icon icon="clipboard" />
          {/if}
        </button>
      </div>
    </div>

    <button type="button" class="open-btn" onclick={openFeed}>
      <Icon icon="box-arrow-up-right" />
      Im Browser öffnen
    </button>
  </div>
</Dialog>

<style>
  @reference "../../app.css";

  .quality-group {
    @apply flex rounded-md overflow-hidden border border-gray-300 dark:border-gray-600 divide-x divide-gray-300 dark:divide-gray-600;
  }

  .quality-option {
    @apply flex-1 text-center py-2 text-sm font-medium cursor-pointer select-none;
    @apply bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300;
    @apply hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors;
  }

  .quality-option.active {
    @apply bg-blue-600 text-white dark:bg-blue-600 dark:text-white;
  }

  .url-input {
    @apply flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0;
  }

  .copy-btn {
    @apply flex items-center justify-center px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer;
  }

  .open-btn {
    @apply w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-4 rounded-lg transition-colors cursor-pointer;
  }
</style>
