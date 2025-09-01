<script lang="ts">
  import type { ResultEntry, VideoPayload } from '$lib/types';
  import { formatDate, formatDuration, formatTime } from '$lib/utils';
  import ChannelTag from './ChannelTag.svelte';
  import Drawer from './Drawer.svelte';
  import Icon from './Icon.svelte';
  import VideoActions from './VideoActions.svelte';

  let { entry, onPlayVideo, isDetailsOpen, onToggleDetails } = $props<{
    entry: ResultEntry;
    onPlayVideo: (payload: VideoPayload) => void;
    isDetailsOpen: boolean;
    onToggleDetails: (id: string) => void;
  }>();

  function toggleDetails(event: MouseEvent | KeyboardEvent) {
    if (event instanceof KeyboardEvent && !['Enter', ' '].includes(event.key)) {
      return;
    }

    if (event instanceof KeyboardEvent && event.key === ' ') {
      event.preventDefault();
    }

    const target = event.target as HTMLElement;
    if (target.closest('a') || target.closest('button')) {
      return;
    }
    onToggleDetails(entry.id);
  }
</script>

<tr class="result-row" role="button" tabindex="0" onclick={toggleDetails} onkeydown={toggleDetails}>
  <td class="p-2 text-nowrap"><ChannelTag href={entry.url_website} target="_blank" rel="noopener noreferrer" channel={entry.channel} /></td>
  <td class="p-2 max-w-[calc(10ch+15vw)] truncate" title={entry.topic}>{entry.topic}</td>
  <td class="p-2 max-w-[calc(25ch+15vw)] truncate" title={entry.title}>{entry.title}</td>
  <td class="p-2 text-center">
    <div class="result-details-row-toggle">
      <Icon icon="chevron-down" title="Aufklappen" class="relative top-0.5 transition-transform {isDetailsOpen ? 'rotate-180' : ''}" />
    </div>
  </td>
  <td class="p-2">{formatDate(entry.timestamp)}</td>
  <td class="p-2">{formatTime(entry.timestamp)}</td>
  <td class="p-2 text-nowrap">{formatDuration(entry.duration)}</td>
  <td class="p-2">
    <div class="grid grid-cols-[repeat(3,1fr)] gap-x-2">
      <VideoActions {entry} {onPlayVideo} view="table-inline" />
    </div>
  </td>
</tr>
<tr class="group result-details-row">
  <td colspan="8" class="p-0 align-top">
    <Drawer isOpen={isDetailsOpen}>
      {#snippet children()}
        <div class="p-4">
          <div class="cursor-default p-4 bg-gray-500/5 dark:bg-gray-500/15 rounded-md not-dark:shadow-md">
            <div class="text-neutral-900/80 dark:text-neutral-50/90">{entry.topic}</div>
            <div class="mb-4 text-lg font-bold">{entry.title}</div>

            <div class="mb-2 text-lg font-semibold">Beschreibung</div>
            <p class="text-neutral-900/80 dark:text-neutral-50/80">{entry.description}</p>
            <div class="mt-4 pt-4 border-t border-gray-500/50">
              <VideoActions {entry} {onPlayVideo} view="drawer" {isDetailsOpen} />
            </div>
          </div>
        </div>
      {/snippet}
    </Drawer>
  </td>
</tr>

<style>
  @reference "../../app.css";

  .result-row,
  .result-details-row {
    @apply text-gray-900 dark:text-gray-100 transition-[color,background-color];
  }

  .result-row {
    @apply cursor-pointer text-sm;
  }

  tr > td {
    @apply bg-white dark:bg-gray-800;
  }

  tr:first-child > td:first-child {
    @apply rounded-tl-md;
  }

  tr:first-child > td:last-child {
    @apply rounded-tr-md;
  }

  tr:last-child > td:first-child {
    @apply rounded-bl-md;
  }

  tr:last-child > td:last-child {
    @apply rounded-br-md;
  }

  tr:nth-child(even of .result-row) > td,
  tr:nth-child(even of .result-details-row) > td {
    @apply bg-gray-50 dark:bg-gray-800/50;
  }

  tr.result-row:hover > td {
    @apply bg-gray-200/70 dark:bg-gray-700/70;
  }

  .result-details-row-toggle {
    @apply cursor-pointer text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white;
  }
</style>
