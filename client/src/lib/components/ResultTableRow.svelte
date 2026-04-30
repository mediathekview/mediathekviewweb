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

  function toggleDetails(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (target.closest('a') || target.closest('button')) {
      return;
    }

    // Skip when the click was actually a text selection drag.
    if ((window.getSelection()?.toString().length ?? 0) > 0) {
      return;
    }

    onToggleDetails(entry.id);
  }
</script>

<tr class="result-row" onclick={toggleDetails}>
  <td class="p-2 text-nowrap"><ChannelTag href={entry.url_website} target="_blank" rel="noopener noreferrer" channel={entry.channel} /></td>
  <td class="p-2"><div class="truncate" title={entry.topic}>{entry.topic}</div></td>
  <td class="p-2"><div class="truncate" title={entry.title}>{entry.title}</div></td>
  <td class="p-2 text-center">
    <button
      type="button"
      class="result-details-row-toggle"
      aria-expanded={isDetailsOpen}
      aria-label={isDetailsOpen ? 'Details zuklappen' : 'Details aufklappen'}
      onclick={() => onToggleDetails(entry.id)}>
      <Icon icon="chevron-down" class="relative top-0.5 transition-transform {isDetailsOpen ? 'rotate-180' : ''}" />
    </button>
  </td>
  <td class="p-2">{formatDate(entry.timestamp)}</td>
  <td class="p-2">{formatTime(entry.timestamp)}</td>
  <td class="p-2 text-nowrap text-right">{formatDuration(entry.duration)}</td>
  <td class="p-2">
    <div class="grid grid-cols-[repeat(4,1fr)] gap-x-2">
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

  .result-row:not(:first-of-type) {
    @apply border-t border-gray-300/75 dark:border-gray-700/75;
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
    @apply inline-flex items-center justify-center w-full cursor-pointer text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white;
  }
</style>
