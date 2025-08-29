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
    view: 'table-inline' | 'drawer';
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
    if (view === 'drawer' && isDetailsOpen && !sizesFetched) {
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

{#if view === 'drawer'}
  <div class="flex flex-wrap justify-between gap-x-12 gap-y-8">
    <div>
      <h4 class="font-semibold mb-3">Qualität</h4>
      <div class="grid grid-cols-[repeat(2,auto)] space-y-2 text-sm">
        {#each qualities as q}
          {#if entry[q.key]}
            <span class="font-medium">{q.name}</span>
            <span class="ml-1 font-normal"> - {sizes[q.name]}</span>
          {/if}
        {/each}
        {#if entry.url_subtitle}
          <span class="font-medium">CC</span>
          <span class="ml-1 font-normal"> - {sizes.subtitle}</span>
        {/if}
      </div>
    </div>
    <div class="flex flex-wrap items-start gap-x-12 gap-y-8">
      <div>
        <h4 class="flex items-center gap-4 font-semibold mb-3">
          Abspielen
          <Icon icon="play-fill" size="xl" />
        </h4>
        <div class="flex gap-x-2 font-bold">
          {#each qualities as q, i}
            {@const url = entry[q.key] as string}
            {#if url}
              <button class="action-btn" title={`${q.name} abspielen`} onclick={(e) => play(e, q.name, url)}>{q.name}</button>
            {/if}
          {/each}
        </div>
      </div>
      <div>
        <h4 class="flex items-center gap-4 font-semibold mb-3">
          Download
          <Icon icon="download" size="lg" />
        </h4>
        <div class="flex gap-x-2 font-bold">
          {#each qualities as q}
            {@const url = entry[q.key] as string}
            {#if url}
              <a href={url} download class="action-btn" onclick={() => trackDownload(q.name)} title={`Download ${q.name}`}>{q.name}</a>
            {/if}
          {/each}
          {#if entry.url_subtitle}
            <a href={entry.url_subtitle} download class="action-btn" title="Untertitel herunterladen">
              <Icon icon="cc-square" size="lg" />
            </a>
          {/if}
        </div>
      </div>
      <div>
        <h4 class="flex items-center gap-4 font-semibold mb-3">
          URL kopieren
          <Icon icon="clipboard" size="lg" />
        </h4>
        <div class="flex gap-x-2 font-bold">
          {#each qualities as q}
            {@const url = entry[q.key] as string}
            {#if url}
              <button class="action-btn" onclick={() => copyToClipboard(q.name, url)} title={`URL kopieren ${q.name}`}>
                {#if copyStatus[q.name] === 'idle'}
                  {q.name}
                {:else if copyStatus[q.name] === 'copied'}
                  <Icon icon="check-lg" size="lg" />
                {:else}
                  <Icon icon="x-lg" size="lg" />
                {/if}
              </button>
            {/if}
          {/each}
          {#if entry.url_subtitle}
            <button class="action-btn" onclick={() => copyToClipboard('subtitle', entry.url_subtitle as string)} title="Untertitel-URL kopieren">
              {#if copyStatus.subtitle === 'idle'}
                <Icon icon="cc-square" size="lg" />
              {:else if copyStatus.subtitle === 'copied'}
                <Icon icon="check-lg" size="lg" />
              {:else}
                <Icon icon="x-lg" size="lg" />
              {/if}
            </button>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  @reference "../../app.css";

  .video-action-link {
    @apply inline-flex items-center justify-center rounded bg-gray-200 px-2 py-1 font-bold text-gray-700 hover:text-gray-900 dark:bg-gray-700 dark:text-gray-100 dark:hover:text-white cursor-pointer;
  }

  .action-btn {
    @apply inline-flex items-center justify-center p-3 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors;
  }
</style>
