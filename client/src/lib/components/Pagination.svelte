<script lang="ts">
  import { appState } from '$lib/store.svelte';
  import Dropdown from './Dropdown.svelte';
  import Icon from './Icon.svelte';

  let totalPages = $derived(Math.min(Math.ceil((appState.queryInfo?.totalResults ?? 0) / appState.itemsPerPage), Math.floor(10000 / appState.itemsPerPage)));

  let pageNumbers = $derived.by(() => {
    const pages = [];
    const currentPage = appState.currentPage;
    const pagingBegin = Math.max(0, currentPage - 2 - (2 - Math.min(2, totalPages - (currentPage + 1))));
    const pagingEnd = Math.min(totalPages, pagingBegin + 5);
    for (let i = pagingBegin; i < pagingEnd; i++) {
      pages.push(i);
    }
    return pages;
  });

  const itemsPerPageOptions = [
    { value: 5, label: '5' },
    { value: 10, label: '10' },
    { value: 15, label: '15' },
    { value: 20, label: '20' },
    { value: 25, label: '25' },
    { value: 50, label: '50' },
  ];
</script>

<div class="flex items-center gap-4 flex-wrap">
  <nav class="flex items-stretch space-x-1">
    <button class="pagination-link pagination-link-arrow" disabled={appState.currentPage <= 0} onclick={() => appState.setCurrentPage(appState.currentPage - 1)}>
      <Icon icon="chevron-left" />
    </button>

    {#each pageNumbers as i}
      <button class="pagination-link" class:active={appState.currentPage === i} onclick={() => appState.setCurrentPage(i)}>
        {i + 1}
      </button>
    {/each}

    <button class="pagination-link pagination-link-arrow" disabled={appState.currentPage >= totalPages - 1} onclick={() => appState.setCurrentPage(appState.currentPage + 1)}>
      <Icon icon="chevron-right" />
    </button>
  </nav>

  <div class="flex items-center gap-2">
    <label for="itemsPerPage" class="text-sm text-gray-600 dark:text-gray-400">Pro Seite:</label>
    <Dropdown id="itemsPerPage" class="w-20" label="Einträge pro Seite" options={itemsPerPageOptions} bind:value={appState.itemsPerPage} />
  </div>
</div>

<style>
  @reference "../../app.css";

  .pagination-link {
    @apply flex items-center justify-center rounded-md px-4 py-2 leading-tight transition-colors duration-250;
    @apply bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400;
  }

  .pagination-link:not(:disabled):not(.active) {
    @apply cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700;
  }

  .pagination-link.active {
    @apply cursor-default bg-blue-600 font-bold text-white;
  }

  .pagination-link:disabled {
    @apply cursor-not-allowed opacity-50;
  }

  .pagination-link-arrow {
    @apply px-2.5 py-2;
  }
</style>
