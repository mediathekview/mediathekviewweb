<script lang="ts">
  import type { ResultEntry, VideoPayload } from '$lib/types';
  import { formatDate, formatDuration, formatTime } from '$lib/utils';
  import ChannelTag from './ChannelTag.svelte';
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
  <td class="p-2 max-w-[30ch] truncate" title={entry.topic}>{entry.topic}</td>
  <td class="p-2 max-w-[75ch] truncate" title={entry.title}>{entry.title}</td>
  <td class="p-2 text-center">
    <div class="result-details-row-toggle">
      <Icon icon="chevron-down" title="Aufklappen" class="transition-transform {isDetailsOpen ? 'rotate-180' : ''}" />
    </div>
  </td>
  <td class="p-2">{formatDate(entry.timestamp)}</td>
  <td class="p-2">{formatTime(entry.timestamp)}</td>
  <td class="p-2">{formatDuration(entry.duration)}</td>
  <td class="p-2">
    <div class="grid grid-cols-[repeat(3,1fr)] gap-x-2">
      <VideoActions {entry} {onPlayVideo} view="table-inline" />
    </div>
  </td>
</tr>
<tr class="group result-details-row">
  <td colspan="8" class="p-0 align-top">
    <div class="drawer" class:open={isDetailsOpen}>
      <div class="drawer-content p-4">
        <div class="cursor-default p-4 bg-neutral-500/5 dark:bg-neutral-500/15 rounded-md not-dark:shadow-md">
          <div class="text-lg font-semibold">{entry.title}</div>
          <div class="mb-4 font-semibold text-neutral-900/70 dark:text-neutral-50/70">{entry.topic}</div>

          <div class="font-semibold mb-2">Beschreibung</div>
          <p>{entry.description}</p>
          <div class="mt-4 pt-4 border-t border-gray-500/50">
            <VideoActions {entry} {onPlayVideo} view="table-drawer" {isDetailsOpen} />
          </div>
        </div>
      </div>
    </div>
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

  .drawer {
    display: grid;
    grid-template-rows: 0fr;
    overflow: hidden;
    transition: grid-template-rows 250ms;
  }

  .drawer.open {
    grid-template-rows: 1fr;
  }

  .drawer .drawer-content {
    min-height: 0;
    transition:
      visibility 250ms,
      opacity 250ms,
      padding 250ms;
    visibility: hidden;
    overflow: hidden;
  }

  .drawer:not(.open) .drawer-content {
    opacity: 0;
    padding: 0;
  }

  .drawer.open .drawer-content {
    visibility: visible;
    opacity: 1;
  }
</style>
