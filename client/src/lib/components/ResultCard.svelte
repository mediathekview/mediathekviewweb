<script lang="ts">
  import type { ResultEntry, VideoPayload } from '$lib/types';
  import { formatDate, formatDuration, formatTime } from '$lib/utils';
  import ChannelTag from './ChannelTag.svelte';
  import Drawer from './Drawer.svelte';
  import VideoActions from './VideoActions.svelte';

  let { entry, onPlayVideo, isDetailsOpen, onToggleDetails, index } = $props<{
    entry: ResultEntry;
    onPlayVideo: (payload: VideoPayload) => void;
    isDetailsOpen: boolean;
    onToggleDetails: (id: string) => void;
    index: number;
  }>();

  const { topic, title, timestamp, duration, channel, url_website } = entry;

  function handleClick(event: MouseEvent | KeyboardEvent) {
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

<div class="result-card" role="button" tabindex="0" onclick={handleClick} onkeydown={handleClick}>
  <div class="p-3">
    <div class="flex justify-between items-start">
      <h3 class="text-sm font-semibold text-gray-900/75 dark:text-gray-300 truncate" {topic}>{topic}</h3>
      <ChannelTag href={url_website} target="_blank" rel="noopener noreferrer" {channel} class="-mt-0.5 -mr-0.5" />
    </div>

    <h2 class="mt-1 font-semibold text-gray-900 dark:text-white" {title}>{title}</h2>
    <div class="mt-1 text-sm text-gray-500 dark:text-gray-300/85">{formatDate(timestamp)} · {formatTime(timestamp)} Uhr · {formatDuration(duration)}</div>
  </div>
  <Drawer isOpen={isDetailsOpen}>
    {#snippet children()}
      <div class="p-3 rounded-md not-dark:shadow-md cursor-default" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
        <div class="mb-2 font-semibold">Beschreibung</div>
        <p class="text-sm text-gray-900/80 dark:text-gray-300">{entry.description}</p>
        <div class="mt-4 pt-4 border-t border-gray-500/50">
          <VideoActions {entry} {onPlayVideo} view="drawer" {isDetailsOpen} />
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
</style>
