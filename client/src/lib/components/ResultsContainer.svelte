<script lang="ts">
  import { appState } from '$lib/store.svelte';
  import type { VideoPayload } from '$lib/types';
  import { formatDate, formatTime } from '$lib/utils';
  import Icon from './Icon.svelte';
  import Pagination from './Pagination.svelte';
  import ResultCard from './ResultCard.svelte';
  import ResultTableRow from './ResultTableRow.svelte';

  let { onPlayVideo } = $props<{ onPlayVideo: (payload: VideoPayload) => void }>();

  let openEntryId = $state<string | null>(null);

  let filmlisteTime = $derived(appState.queryInfo ? `am ${formatDate(appState.queryInfo.filmlisteTimestamp)} um ${formatTime(appState.queryInfo.filmlisteTimestamp)} Uhr` : '');

  let queryInfoLabel = $derived.by(() => {
    if (appState.error) {
      return `Fehler:<br/>${appState.error}`;
    }
    if (!appState.queryInfo || appState.results.length === 0) {
      return `Die Suche dauerte ${appState.queryInfo?.searchEngineTime.toString().replace('.', ',') ?? 0} ms. Keine Treffer gefunden.<br/>Filmliste zuletzt ${filmlisteTime} aktualisiert.`;
    }
    const total = appState.queryInfo.totalResults;
    const start = Math.min(total, appState.currentPage * appState.itemsPerPage + 1);
    const end = Math.min(total, (appState.currentPage + 1) * appState.itemsPerPage);
    return `Die Suche dauerte ${appState.queryInfo.searchEngineTime.toString().replace('.', ',')} ms. Zeige Treffer ${start} bis ${end} von insgesamt ${total}.<br/>Filmliste zuletzt ${filmlisteTime} aktualisiert.`;
  });

  function handleToggleDetails(id: string) {
    openEntryId = openEntryId === id ? null : id;
  }
</script>

<div>
  {#if appState.results.length > 0}
    {#if appState.viewMode === 'grid'}
      <div class="grid grid-cols-1 gap-4">
        {#each appState.results as entry (entry.id)}
          <ResultCard {entry} {onPlayVideo} />
        {/each}
      </div>
    {:else}
      <div class="overflow-x-auto min-w-[100ch] rounded-b-md">
        <table class="table-auto min-w-full">
          <thead class="text-sm font-semibold text-gray-700 dark:text-gray-300">
            <tr class="[&>th>div]:h-10 [&>th>div]:flex [&>th>div]:items-center [&>th]:pb-3 [&>th>div]:p-2 [&>th>div]:bg-white dark:[&>th>div]:bg-gray-800">
              <th class="w-px">
                <div class="rounded-l-md">Sender</div>
              </th>
              <th class="w-px">
                <div>Thema</div>
              </th>
              <th>
                <div>Titel</div>
              </th>
              <th class="w-px">
                <div>
                  <Icon icon="card-text" />
                </div>
              </th>
              <th class="w-px">
                <div>Datum</div>
              </th>
              <th class="w-px">
                <div>Zeit</div>
              </th>
              <th class="w-px">
                <div>Dauer</div>
              </th>
              <th class="w-px">
                <div class="justify-center rounded-r-md">Abspielen</div>
              </th>
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
    <div>
      <p class="mb-0 text-gray-600 dark:text-gray-400 text-sm">
        {@html queryInfoLabel}
      </p>
    </div>
    <Pagination />
  </footer>
</div>
