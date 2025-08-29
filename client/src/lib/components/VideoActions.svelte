<script lang="ts">
  import type { ResultEntry, VideoPayload, VideoQuality } from '$lib/types';
  import { formatBytes, playVideoInNewWindow, trackEvent } from '$lib/utils';
  import Icon from './Icon.svelte';

  let {
    entry,
    view,
    onPlayVideo,
    isDetailsOpen = false,
  } = $props<{
    entry: ResultEntry;
    view: 'card' | 'table-inline' | 'table-drawer';
    onPlayVideo: (payload: VideoPayload) => void;
    isDetailsOpen?: boolean;
  }>();

  const qualities: { key: keyof ResultEntry; name: VideoQuality }[] = [
    { key: 'url_video_hd', name: 'HD' },
    { key: 'url_video', name: 'SD' },
    { key: 'url_video_low', name: 'LQ' },
  ];

  let sizes = $state<Record<VideoQuality | 'subtitle', string>>({ HD: '? MB', SD: '? MB', LQ: '? MB', subtitle: '? MB' });
  let sizesFetched = $state(false);

  let copyStatus = $state<Record<VideoQuality | 'subtitle', 'idle' | 'copied' | 'error'>>({ HD: 'idle', SD: 'idle', LQ: 'idle', subtitle: 'idle' });

  async function fetchSize(quality: VideoQuality | 'subtitle', url: string) {
    if (!url) return;
    try {
      const res = await fetch(`/api/content-length?url=${encodeURIComponent(url)}`);
      const lengthStr = await res.text();
      const length = parseInt(lengthStr, 10);
      if (!isNaN(length) && length > 0) {
        sizes[quality] = formatBytes(length);
      }
    } catch (e) {
      console.error('Failed to fetch content length', e);
    }
  }

  $effect(() => {
    if (view === 'table-drawer' && isDetailsOpen && !sizesFetched) {
      qualities.forEach((q) => fetchSize(q.name, entry[q.key] as string));
      if (entry.url_subtitle) {
        fetchSize('subtitle', entry.url_subtitle);
      }
      sizesFetched = true;
    }
  });

  async function play(event: MouseEvent, quality: VideoQuality, url: string) {
    event.stopPropagation();

    trackEvent('Play Video', {
      channel: entry.channel,
      topic: entry.topic,
      title: entry.title,
      quality,
    });

    if (url.startsWith('http://')) {
      await playVideoInNewWindow(url);
      return;
    }

    onPlayVideo({
      channel: entry.channel,
      topic: entry.topic,
      title: entry.title,
      quality,
      url,
      url_subtitle: entry.url_subtitle,
    });
  }

  function trackDownload(quality: VideoQuality) {
    trackEvent('Download Video', {
      channel: entry.channel,
      topic: entry.topic,
      title: entry.title,
      quality,
    });
  }

  async function copyToClipboard(quality: VideoQuality | 'subtitle', url: string) {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      copyStatus[quality] = 'copied';
      trackEvent('Copy URL', {
        channel: entry.channel,
        topic: entry.topic,
        title: entry.title,
        quality,
      });
    } catch (err) {
      console.error('Failed to copy: ', err);
      copyStatus[quality] = 'error';
    }
    setTimeout(() => {
      copyStatus[quality] = 'idle';
    }, 2000);
  }
</script>

{#if view === 'card'}
  <div class="flex items-center space-x-2">
    {#each qualities as q}
      {@const url = entry[q.key] as string}
      {#if url}
        <button class="video-action-link" title={`${q.name} abspielen`} onclick={(e) => play(e, q.name, url)}>{q.name}</button>
      {/if}
    {/each}
    {#if entry.url_subtitle}
      <a href={entry.url_subtitle} title="Untertitel herunterladen" class="video-action-link">
        <Icon icon="badge-cc" size="base" class="leading-none" />
      </a>
    {/if}
  </div>
{/if}

{#if view === 'table-inline'}
  {#each qualities as q}
    {@const url = entry[q.key] as string}
    {#if url}
      <button class="video-action-link -my-1" title={`${q.name} abspielen`} onclick={(e) => play(e, q.name, url)}>{q.name}</button>
    {:else}
      <span></span>
    {/if}
  {/each}
{/if}

{#if view === 'table-drawer'}
  <div class="inline-grid grid-cols-[repeat(5,auto)] items-center gap-4">
    <!-- Row 1: Quality Labels -->
    <div class="pr-4 text-right text-sm font-semibold">Qualität:</div>
    {#each qualities as q}
      {@const url = entry[q.key] as string}
      <div class="text-center text-sm font-semibold">
        {#if url}
          <div>{q.name}</div>
          {#if sizes[q.name] !== '? MB'}
            <div class="text-xs font-normal">({sizes[q.name]})</div>
          {/if}
        {/if}
      </div>
    {/each}
    <div class="text-center text-sm font-semibold">
      {#if entry.url_subtitle}
        CC
        {#if sizes.subtitle !== '? MB'}
          <span class="ml-1 text-xs font-normal">({sizes.subtitle})</span>
        {/if}
      {/if}
    </div>

    <!-- Row 2: Play Buttons -->
    <div class="pr-4 text-right text-sm font-semibold">Abspielen:</div>
    {#each qualities as q}
      {@const url = entry[q.key] as string}
      <div class="flex justify-center">
        {#if url}
          <button class="video-action-link w-16 h-8" onclick={(e) => play(e, q.name, url)} title={`${q.name} abspielen`}>
            <Icon icon="play-fill" size="lg" />
          </button>
        {:else}
          <div class="w-16 h-8"></div>
        {/if}
      </div>
    {/each}
    <div class="flex justify-center">
      <div class="w-16 h-8"></div>
      <!-- Placeholder for subtitle play button -->
    </div>

    <!-- Row 3: Download Buttons -->
    <div class="pr-4 text-right text-sm font-semibold">Download:</div>
    {#each qualities as q}
      {@const url = entry[q.key] as string}
      <div class="flex justify-center">
        {#if url}
          <a href={url} download class="video-action-link w-16 h-8" onclick={() => trackDownload(q.name)} title={`Download ${q.name}`}>
            <Icon icon="download" size="base" />
          </a>
        {:else}
          <div class="w-16 h-8"></div>
        {/if}
      </div>
    {/each}
    <div class="flex justify-center">
      {#if entry.url_subtitle}
        <a href={entry.url_subtitle} download class="video-action-link w-16 h-8" title="Untertitel herunterladen">
          <Icon icon="badge-cc" size="base" />
        </a>
      {:else}
        <div class="w-16 h-8"></div>
      {/if}
    </div>

    <!-- Row 4: Copy URL Buttons -->
    <div class="pr-4 text-right text-sm font-semibold">URL kopieren:</div>
    {#each qualities as q}
      {@const url = entry[q.key] as string}
      <div class="flex justify-center">
        {#if url}
          <button class="video-action-link w-16 h-8" onclick={() => copyToClipboard(q.name, url)} title={`URL kopieren ${q.name}`}>
            {#if copyStatus[q.name] === 'idle'}
              <Icon icon="clipboard" size="base" />
            {:else if copyStatus[q.name] === 'copied'}
              <Icon icon="check-lg" size="base" />
            {:else}
              <Icon icon="x-lg" size="base" />
            {/if}
          </button>
        {:else}
          <div class="w-16 h-8"></div>
        {/if}
      </div>
    {/each}
    <div class="flex justify-center">
      {#if entry.url_subtitle}
        <button class="video-action-link w-16 h-8" onclick={() => copyToClipboard('subtitle', entry.url_subtitle as string)} title="Untertitel-URL kopieren">
          {#if copyStatus.subtitle === 'idle'}
            <Icon icon="clipboard" size="base" />
          {:else if copyStatus.subtitle === 'copied'}
            <Icon icon="check-lg" size="base" />
          {:else}
            <Icon icon="x-lg" size="base" />
          {/if}
        </button>
      {:else}
        <div class="w-16 h-8"></div>
      {/if}
    </div>
  </div>
{/if}

<style>
  @reference "../../app.css";

  .video-action-link {
    @apply inline-flex items-center justify-center rounded bg-gray-200 px-2 py-1 font-bold text-gray-700 hover:text-gray-900 dark:bg-gray-700 dark:text-gray-300 dark:hover:text-white cursor-pointer;
  }
</style>
