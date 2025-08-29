<script lang="ts">
  import type { ResultEntry, VideoPayload } from '$lib/types';
  import { formatDate, formatTime, formatDuration } from '$lib/utils';
  import ChannelTag from './ChannelTag.svelte';
  import VideoActions from './VideoActions.svelte';

  let { entry, onPlayVideo } = $props<{ entry: ResultEntry; onPlayVideo: (payload: VideoPayload) => void }>();

  const { title, description, timestamp, duration, channel, topic, url_website } = entry;
</script>

<div class="result-card">
  <div>
    <div class="grid grid-cols-[1fr_auto] items-start gap-4">
      <div class="min-w-0">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white truncate" {title}>{title}</h2>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2" title={description}>
          {description || 'Keine Beschreibung verfügbar.'}
        </p>
      </div>
      <div class="text-right text-sm text-gray-500 dark:text-gray-400">
        <p class="mb-0">{formatDate(timestamp)}, {formatTime(timestamp)} Uhr</p>
        <p class="mb-0">Dauer: {formatDuration(duration)}</p>
      </div>
    </div>
  </div>
  <div class="mt-4 grid grid-cols-[1fr_auto] items-end gap-2">
    <div class="flex items-center min-w-0">
      <ChannelTag href={url_website} target="_blank" rel="noopener noreferrer" {channel} class="mr-2" />
      <span class="text-gray-500 dark:text-gray-400 text-sm truncate" {topic}>{topic}</span>
    </div>
    <div class="flex items-stretch gap-x-2 text-sm text-gray-500 dark:text-gray-400">
      <VideoActions {entry} {onPlayVideo} view="card" />
    </div>
  </div>
</div>

<style>
  @reference "../../app.css";

  .result-card {
    @apply bg-white dark:bg-gray-800 rounded-lg p-4 grid grid-rows-[1fr_auto] shadow-sm dark:shadow-none;
  }
</style>
