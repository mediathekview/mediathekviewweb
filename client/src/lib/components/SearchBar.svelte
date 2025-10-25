<script lang="ts">
  import { appState } from '$lib/store.svelte';
  import { trackEvent } from '$lib/utils';
  import Dropdown from './Dropdown.svelte';
  import Icon from './Icon.svelte';
  import Toggle from './Toggle.svelte';

  const sortValue = $derived(`${appState.sortBy}_${appState.sortOrder}`);

  let channelMenuOpen = $state(false);

  function handleChannelClick(channel: string) {
    channelMenuOpen = false;
    appState.query = `!${channel}`
  }

  function handleSortChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target) {
      const [sortBy, sortOrder] = target.value.split('_');
      appState.setSort(sortBy, sortOrder);
    }
  }

  const sortOptions = [
    { value: 'timestamp_desc', label: 'Datum ↓' },
    { value: 'timestamp_asc', label: 'Datum ↑' },
    { value: 'duration_desc', label: 'Dauer ↓' },
    { value: 'duration_asc', label: 'Dauer ↑' },
    { value: 'channel_asc', label: 'Sender ↑' },
    { value: 'channel_desc', label: 'Sender ↓' },
    // { value: 'topic_asc', label: 'Thema (A-Z)' },
    // { value: 'topic_desc', label: 'Thema (Z-A)' },
    // { value: 'title_asc', label: 'Titel (A-Z)' },
    // { value: 'title_desc', label: 'Titel (Z-A)' },
  ];
</script>

<div class="panel mb-6">
  <div class="flex flex-wrap items-center gap-4">
    <div class="search-input-wrapper flex-grow min-w-[15rem]">
      <div class="search-input-icon">
        <Icon icon="search" class="text-gray-600 dark:text-gray-300" />
      </div>
      <input type="text" class="search-input" placeholder="Suche nach Sendungen, z.B. !ARD #Tatort >80" title="Selektoren:&#13;!Sender&#13;#Thema&#13;+Titel&#13;*Beschreibung&#13;&lt;x (in Minuten)&#13;&gt;x (in Minuten)" bind:value={appState.query} />
      <button tabindex="-1" class="search-input-clear {appState.query.length > 0 ? 'opacity-100' : 'opacity-0'}" onclick={() => (appState.query = '')}>
        <Icon icon="x-lg" />
      </button>
    </div>
    <div class="relative">
      <button class="nav-link flex gap-2 items-center" type="button" onclick={() => (channelMenuOpen = !channelMenuOpen)}>
        Kanäle <Icon icon="chevron-down" />
      </button>
      {#if channelMenuOpen}
        <div class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-10 max-h-80 overflow-y-auto" role="menu" aria-orientation="vertical">
          {#each appState.channelOptions as channel}
            <button  class="dropdown-item w-full text-left" onclick={() => handleChannelClick(channel)}>{channel}</button>
          {/each}
        </div>
      {/if}
    </div>
    <div class="flex items-center gap-4">
      <Toggle label="Überall" bind:checked={appState.everywhere} />
      <Toggle label="Zukünftige" bind:checked={appState.future} />
    </div>
    <div class="flex items-stretch gap-2 min-h-10">
      {#if appState.viewMode === 'grid'}
        <Dropdown label="Sortierung" options={sortOptions} value={sortValue} onchange={handleSortChange} />
      {/if}
      <button class="icon-btn" type="button" title={appState.viewMode === 'grid' ? 'Listenansicht' : 'Kartenansicht'} onclick={appState.toggleViewMode}>
        <Icon icon={appState.viewMode === 'grid' ? 'table' : 'grid'} class="text-gray-600 dark:text-gray-300" />
      </button>
      <button class="icon-btn" type="button" title="RSS-Feed" onclick={appState.openRssFeed}>
        <Icon icon="rss" class="text-gray-600 dark:text-gray-300" />
      </button>
      <a href="https://github.com/mediathekview/mediathekviewweb/blob/master/README.md" target="_blank" rel="noopener noreferrer" class="icon-btn" title="Hilfe" onclick={() => trackEvent('Click Help')}>
        <Icon icon="question-circle" class="text-gray-600 dark:text-gray-300" />
      </a>
    </div>
  </div>
</div>

<style>
  @reference "../../app.css";

  .panel {
    @apply bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm dark:shadow-none;
  }

  .icon-btn {
    @apply inline-flex items-center justify-center rounded-md px-3 cursor-pointer transition-colors duration-250;
    @apply bg-gray-200/75 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 group-hover:bg-gray-200 dark:group-hover:bg-gray-600;
  }

  .search-input-wrapper {
    @apply relative;
  }

  .search-input-icon {
    @apply absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none;
  }

  .search-input {
    @apply w-full rounded-md border border-gray-300 bg-gray-50 py-2 pl-10 pr-10 text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-300 dark:focus:ring-blue-500;
  }

  .search-input-clear {
    @apply absolute right-0 inset-y-0 flex items-center px-4 leading-none text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white cursor-pointer transition-opacity;
  }
</style>
