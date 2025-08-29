<script lang="ts">
  import { appState } from '$lib/store.svelte';
  import Dropdown from './Dropdown.svelte';
  import Icon from './Icon.svelte';

  let sortValue = $state(`${appState.sortBy}_${appState.sortOrder}`);

  $effect(() => {
    const [sortBy, sortOrder] = sortValue.split('_');
    if (sortBy !== appState.sortBy || sortOrder !== appState.sortOrder) {
      appState.setSort(sortBy, sortOrder);
    }
  });

  $effect(() => {
    sortValue = `${appState.sortBy}_${appState.sortOrder}`;
  });

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
    <div class="search-input-wrapper flex-grow min-w-[250px]">
      <div class="search-input-icon">
        <Icon icon="search" class="text-gray-600 dark:text-gray-300" />
      </div>
      <input type="text" class="search-input" placeholder="Suche nach Sendungen, z.B. !ARD #Tatort >80" title="Selektoren:&#13;!Sender&#13;#Thema&#13;+Titel&#13;*Beschreibung&#13;&lt;x (in minuten)&#13;&gt;x (in minuten)" bind:value={appState.query} />
      <button tabindex="-1" class="search-input-clear {appState.query.length > 0 ? 'opacity-100' : 'opacity-0'}" onclick={() => (appState.query = '')}>
        <Icon icon="x-lg" />
      </button>
    </div>
    <div class="checkbox-wrapper">
      <input id="everywhereCheckbox" type="checkbox" name="everywhere" class="form-checkbox" bind:checked={appState.everywhere} />
      <label for="everywhereCheckbox" class="checkbox-label">Überall</label>
    </div>
    <div class="checkbox-wrapper">
      <input id="futureCheckbox" type="checkbox" name="future" class="form-checkbox" bind:checked={appState.future} />
      <label for="futureCheckbox" class="checkbox-label">Zukünftige</label>
    </div>
    <div class="flex items-stretch gap-2 md:ml-auto">
      <Dropdown label="Sortierung" options={sortOptions} bind:value={sortValue} />
      <button class="icon-btn" type="button" title={appState.viewMode === 'grid' ? 'Listenansicht' : 'Kartenansicht'} onclick={appState.toggleViewMode}>
        <Icon icon={appState.viewMode === 'grid' ? 'table' : 'grid'} class="text-gray-600 dark:text-gray-300" />
      </button>
      <button class="icon-btn" type="button" title="RSS-Feed" onclick={appState.openRssFeed}>
        <Icon icon="rss" class="text-gray-600 dark:text-gray-300" />
      </button>
      <a href="https://github.com/mediathekview/mediathekviewweb/blob/master/README.md" target="_blank" rel="noopener noreferrer" class="icon-btn" title="Hilfe">
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
    @apply inline-flex items-center justify-center rounded-md p-2 cursor-pointer transition-colors duration-250;
    @apply bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 group-hover:bg-gray-200 dark:group-hover:bg-gray-600;
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

  .form-checkbox {
    @apply h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-blue-600 dark:ring-offset-gray-800;
  }

  .checkbox-wrapper {
    @apply flex items-center;
  }

  .checkbox-label {
    @apply ml-2 text-sm font-medium text-gray-900 dark:text-gray-300;
  }
</style>
