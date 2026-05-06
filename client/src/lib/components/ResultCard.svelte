<script lang="ts">
  import type { ResultEntry, VideoPayload } from '$lib/types';
  import { formatDate, formatDuration, formatTime, isToggleClick } from '$lib/utils';
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

  const { topic, title, timestamp, duration, channel, url_website } = entry;

  function handleClick(event: MouseEvent) {
    if (isToggleClick(event)) {
      onToggleDetails(entry.id);
    }
  }
</script>

<div class="result-card" onclick={handleClick}>
  <div class="p-3">
    <div class="flex justify-between items-start gap-2">
      <div class="text-sm font-semibold text-gray-900/75 dark:text-gray-300 truncate" title={topic}>{topic}</div>
      <ChannelTag href={url_website} target="_blank" rel="noopener noreferrer" {channel} class="-mt-0.5 -mr-0.5" />
    </div>

    <h3 class="mt-1 font-semibold text-gray-900 dark:text-white" {title}>{title}</h3>
    <div class="mt-1 flex items-center justify-between gap-2 text-sm text-gray-500 dark:text-gray-300/85">
      <span>{formatDate(timestamp)} · {formatTime(timestamp)} Uhr · {formatDuration(duration)}</span>
      <button
        type="button"
        class="result-card-toggle"
        aria-expanded={isDetailsOpen}
        aria-label={isDetailsOpen ? 'Details zuklappen' : 'Details aufklappen'}
        onclick={(e) => {
          e.stopPropagation();
          onToggleDetails(entry.id);
        }}>
        <Icon icon="chevron-down" class="transition-transform {isDetailsOpen ? 'rotate-180' : ''}" />
      </button>
    </div>
  </div>
  <Drawer isOpen={isDetailsOpen}>
    {#snippet children()}
      <div class="p-3 rounded-md not-dark:shadow-md cursor-default" onclick={(e) => e.stopPropagation()}>
        <div class="flex flex-col sm:flex-row items-start gap-4">
          <p class="flex-1 text-sm text-gray-900/80 dark:text-gray-300">{entry.description}</p>
          <div class="shrink-0 w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-gray-500/30 pt-4 sm:pt-0 sm:pl-4">
            <VideoActions {entry} {onPlayVideo} view="drawer" {isDetailsOpen} />
          </div>
        </div>
      </div>
    {/snippet}
  </Drawer>
</div>

<style>
  @reference "../../app.css";

  .result-card {
    @apply bg-white dark:bg-gray-800 hover:bg-gray-200/70 hover:dark:bg-gray-700/60 rounded-lg shadow-sm dark:shadow-none cursor-pointer transition-colors duration-250;
  }

  .result-card-toggle {
    @apply inline-flex items-center justify-center cursor-pointer text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white;
  }
</style>
