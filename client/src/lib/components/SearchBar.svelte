<script lang="ts">
  import { appState } from '$lib/store.svelte';
  import Dropdown from './Dropdown.svelte';
  import Icon from './Icon.svelte';
  import Toggle from './Toggle.svelte';

  let { showHelp, showRssFeed } = $props<{ showHelp: () => void; showRssFeed: () => void }>();

  const sortValue = $derived(`${appState.sortBy}_${appState.sortOrder}`);

  const dateFrom = $derived(appState.timestampFrom != undefined ? new Date(appState.timestampFrom * 1000).toISOString().slice(0, 10) : '');
  const dateTo = $derived(appState.timestampTo != undefined ? new Date(appState.timestampTo * 1000).toISOString().slice(0, 10) : '');

  function handleDateFromChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    appState.timestampFrom = value ? Math.floor(new Date(value).getTime() / 1000) : undefined;
  }

  function handleDateToChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    appState.timestampTo = value ? Math.floor(new Date(value).getTime() / 1000) : undefined;
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
    { value: 'topic_asc', label: 'Thema ↑' },
    { value: 'topic_desc', label: 'Thema ↓' },
    { value: 'title_asc', label: 'Titel ↑' },
    { value: 'title_desc', label: 'Titel ↓' },
  ];
</script>

<div class="panel mb-6">
  <div class="flex flex-wrap items-center gap-4">
    <div class="search-input-wrapper flex-grow min-w-[15rem]">
      <div class="search-input-icon">
        <Icon icon="search" class="text-gray-600 dark:text-gray-300" />
      </div>
      <label for="search-input" class="sr-only">Suche</label>
      <input id="search-input" type="search" class="search-input" placeholder="Suche nach Sendungen, z.B. !ARD #Tatort >80" title="Selektoren:&#13;!Sender&#13;#Thema&#13;+Titel&#13;*Beschreibung&#13;&lt;x (in Minuten)&#13;&gt;x (in Minuten)" bind:value={appState.query} />
      {#if appState.query.length > 0}
        <button tabindex="-1" type="button" aria-label="Suche zurücksetzen" class="search-input-right" onclick={() => (appState.query = '')}>
          <Icon icon="x-lg" />
        </button>
      {:else}
        <button type="button" aria-label="Hilfe" class="search-input-right" onclick={showHelp}>
          <Icon icon="question-circle" />
        </button>
      {/if}
    </div>
    <div class="flex items-center gap-4">
      <Toggle label="Überall" bind:checked={appState.everywhere} />
      <Toggle label="Zukünftige" bind:checked={appState.future} />
    </div>
    <div class="flex items-center gap-2">
      <label for="date-from" class="date-label">Von</label>
      <input id="date-from" type="date" class="date-input" value={dateFrom} onchange={handleDateFromChange} />
      <label for="date-to" class="date-label">Bis</label>
      <input id="date-to" type="date" class="date-input" value={dateTo} onchange={handleDateToChange} />
    </div>
    <div class="flex items-stretch gap-2 min-h-10">
      {#if appState.viewMode === 'grid'}
        <Dropdown label="Sortierung" options={sortOptions} value={sortValue} onchange={handleSortChange} />
      {/if}
      <button class="icon-btn" type="button" aria-label={appState.viewMode === 'grid' ? 'Listenansicht' : 'Kartenansicht'} title={appState.viewMode === 'grid' ? 'Listenansicht' : 'Kartenansicht'} onclick={appState.toggleViewMode}>
        <Icon icon={appState.viewMode === 'grid' ? 'table' : 'grid'} class="text-gray-600 dark:text-gray-300" />
      </button>
      <button class="icon-btn" type="button" aria-label="RSS-Feed" title="RSS-Feed" onclick={showRssFeed}>
        <Icon icon="rss" class="text-gray-600 dark:text-gray-300" />
      </button>
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

    &::-webkit-search-cancel-button {
      display: none;
    }
  }

  .search-input-right {
    @apply absolute right-0 inset-y-0 flex items-center px-4 leading-none text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white cursor-pointer transition-opacity;
  }

  .date-input {
    @apply h-10 rounded-md border border-gray-300 bg-gray-50 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-500;
    color-scheme: light dark;
  }

  .date-label {
    @apply text-sm text-gray-700 dark:text-gray-300;
  }
</style>
