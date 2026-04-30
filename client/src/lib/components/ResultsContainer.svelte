<script lang="ts">
  import { appState } from '$lib/store.svelte';
  import type { SortBy, VideoPayload } from '$lib/types';
  import { formatDate, formatTime } from '$lib/utils';
  import Icon from './Icon.svelte';
  import Pagination from './Pagination.svelte';
  import ResultCard from './ResultCard.svelte';
  import ResultTableRow from './ResultTableRow.svelte';

  let { onPlayVideo } = $props<{ onPlayVideo: (payload: VideoPayload) => void }>();

  let openEntryId = $state<string | null>(null);

  function handleToggleDetails(id: string) {
    openEntryId = openEntryId === id ? null : id;
  }

  const queryStats = $derived.by(() => {
    if (!appState.queryInfo || appState.queryInfo.totalResults === 0) {
      return null;
    }

    const total = appState.queryInfo.totalResults;
    const start = Math.min(total, appState.currentPage * appState.itemsPerPage + 1);
    const end = Math.min(total, (appState.currentPage + 1) * appState.itemsPerPage);

    return { total, start, end };
  });

  const tableHeaders: {
    label?: string;
    sortKey?: SortBy;
    sortType?: 'alpha' | 'numeric';
    icon?: string;
    colClass?: string;
    divClass?: string;
  }[] = [
    {
      label: 'Sender',
      sortKey: 'channel',
      sortType: 'alpha',
      colClass: 'w-32',
      divClass: 'rounded-l-md',
    },
    {
      label: 'Thema',
    },
    {
      label: 'Titel',
    },
    {
      icon: 'card-text',
      colClass: 'w-12',
    },
    {
      label: 'Datum',
      sortKey: 'timestamp',
      sortType: 'numeric',
      colClass: 'w-28',
    },
    {
      label: 'Zeit',
      colClass: 'w-16',
    },
    {
      label: 'Dauer',
      sortKey: 'duration',
      sortType: 'numeric',
      colClass: 'w-20',
    },
    {
      label: 'Abspielen',
      colClass: 'w-48',
      divClass: 'justify-center rounded-r-md',
    },
  ];
</script>

<div>
  {#if appState.results.length > 0}
    {#if appState.viewMode === 'grid'}
      <div class="space-y-4">
        {#each appState.results as entry (entry.id)}
          <ResultCard {entry} {onPlayVideo} isDetailsOpen={openEntryId === entry.id} onToggleDetails={handleToggleDetails} />
        {/each}
      </div>
    {:else}
      <div class="overflow-x-auto rounded-b-md">
        <table class="table-fixed w-full min-w-[59rem]">
          <colgroup>
            {#each tableHeaders as header}
              <col class={header.colClass ?? ''} />
            {/each}
          </colgroup>
          <thead class="text-sm font-semibold text-gray-700 dark:text-gray-300">
            <tr class="[&>th>div]:h-10 [&>th>div]:flex [&>th>div]:items-center [&>th]:pb-3 [&>th>div]:px-2 [&>th>div]:py-0 [&>th>div]:bg-white dark:[&>th>div]:bg-gray-800">
              {#each tableHeaders as header}
                <th>
                  <div class={header.divClass ?? ''}>
                    {#if header.sortKey}
                      {@const isActive = appState.sortBy === header.sortKey}
                      {@const sortIcon = isActive ? (header.sortType === 'alpha' ? (appState.sortOrder === 'asc' ? 'sort-alpha-down' : 'sort-alpha-up') : appState.sortOrder === 'asc' ? 'sort-numeric-down' : 'sort-numeric-up') : 'arrow-down-up'}
                      <button class="sort-btn" onclick={() => appState.toggleSort(header.sortKey!)}>
                        <span>{header.label}</span>
                        <span class="sort-icon">
                          <Icon icon={sortIcon} class={!isActive ? 'opacity-30' : ''} />
                        </span>
                      </button>
                    {:else if header.icon}
                      <Icon icon={header.icon} />
                    {:else}
                      {header.label}
                    {/if}
                  </div>
                </th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each appState.results as entry (entry.id)}
              <ResultTableRow {entry} {onPlayVideo} isDetailsOpen={openEntryId === entry.id} onToggleDetails={handleToggleDetails} />
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  {:else}
    <div class="text-center p-5 text-gray-600 dark:text-gray-400">Keine Einträge vorhanden</div>
  {/if}

  <footer class="flex justify-between items-center flex-wrap gap-4 mt-3 pt-3 border-t border-neutral-500/40">
    <div class="mb-0 text-gray-600 dark:text-gray-400 text-sm">
      {#if appState.error}
        Fehler:<br />{appState.error}
      {:else if appState.queryInfo}
        {#if queryStats}
          Zeige Treffer {queryStats.start} bis {queryStats.end} von {appState.queryInfo.totalRelation === 'gte' ? 'mehr als ' : ''}{queryStats.total} ({appState.queryInfo.searchEngineTime.toString().replace('.', ',')} ms).
        {:else}
          Die Suche dauerte {appState.queryInfo.searchEngineTime.toString().replace('.', ',')} ms. Keine Treffer gefunden.
        {/if}
        <br />
        {#if (appState.queryInfo.totalEntries ?? 0) > 0}
          Insgesamt {new Intl.NumberFormat('de-DE').format(appState.queryInfo.totalEntries!)} Einträge.&nbsp;
        {/if}
        Inhalt zuletzt am {formatDate(appState.queryInfo.filmlisteTimestamp)} um {formatTime(appState.queryInfo.filmlisteTimestamp)} Uhr aktualisiert.
      {/if}
    </div>
    <Pagination />
  </footer>
</div>

<style>
  @reference "../../app.css";

  .sort-btn {
    @apply flex items-center gap-1;
  }

  .sort-icon {
    @apply inline-flex items-center flex-shrink-0;
  }
</style>
