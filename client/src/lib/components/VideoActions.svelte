<script lang="ts">
  import { castVideo, isChromeBasedBrowser } from '$lib/cast';
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

  const showCastButton = isChromeBasedBrowser();

  let sizes = $state<Record<VideoQuality | 'subtitle', string>>({ HD: '? MB', SD: '? MB', LQ: '? MB', subtitle: '? MB' });
  let sizesFetched = $state(false);

  let copyStatus = $state<Record<VideoQuality | 'subtitle', 'idle' | 'copied' | 'error'>>({ HD: 'idle', SD: 'idle', LQ: 'idle', subtitle: 'idle' });
  let pointerDownAt = 0;

  function recordPointerDown() {
    pointerDownAt = Date.now();
  }

  function isLongPress(): boolean {
    return Date.now() - pointerDownAt > 500;
  }

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

    if (isLongPress()) {
      return;
    }

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

  async function cast(event: MouseEvent, url: string) {
    event.stopPropagation();

    if (isLongPress()) {
      return;
    }

    await castVideo({
      channel: entry.channel,
      topic: entry.topic,
      title: entry.title,
      url,
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
      <a
        href={url}
        class="video-action-link -my-1.5"
        title={`${q.name} abspielen`}
        onpointerdown={recordPointerDown}
        onclick={(e) => {
          e.preventDefault();
          play(e, q.name, url);
        }}>{q.name}</a>
    {:else}
      <span></span>
    {/if}
  {/each}
  {#if entry.url_subtitle}
    <a href={entry.url_subtitle} target="_blank" rel="noopener noreferrer" class="video-action-link -my-1.5" title={`Untertitel`}>CC</a>
  {/if}
{/if}

{#if view === 'drawer'}
  <table class="drawer-table">
    <tbody>
      {#each qualities as q}
        {@const url = entry[q.key] as string}
        {#if url}
          <tr>
            <td class="quality-name">{q.name}</td>
            <td class="quality-size">{sizes[q.name]}</td>
            <td>
              <a
                href={url}
                class="action-btn"
                title={`${q.name} abspielen`}
                onpointerdown={recordPointerDown}
                onclick={(e) => {
                  e.preventDefault();
                  play(e, q.name, url);
                }}>
                <Icon icon="play-fill" />
              </a>
            </td>
            <td>
              <a href={url} download target="_blank" rel="noopener noreferrer" class="action-btn" title={`Download ${q.name}`} onclick={() => trackDownload(q.name)}>
                <Icon icon="download" />
              </a>
            </td>
            <td>
              <a
                href={url}
                class="action-btn"
                title={`URL kopieren ${q.name}`}
                onclick={(e) => {
                  if (e.button !== 0) return;
                  e.preventDefault();
                  copyToClipboard(q.name, url);
                }}>
                {#if copyStatus[q.name] === 'idle'}
                  <Icon icon="link-45deg" />
                {:else if copyStatus[q.name] === 'copied'}
                  <Icon icon="check-lg" />
                {:else}
                  <Icon icon="x-lg" />
                {/if}
              </a>
            </td>
            {#if showCastButton}
              <td>
                <button class="action-btn" title={`${q.name} auf Chromecast abspielen`} onpointerdown={recordPointerDown} onclick={(e) => cast(e, url)}>
                  <Icon icon="cast" />
                </button>
              </td>
            {/if}
          </tr>
        {/if}
      {/each}
      {#if entry.url_subtitle}
        <tr>
          <td class="quality-name">CC</td>
          <td class="quality-size">{sizes.subtitle}</td>
          <td></td>
          <td>
            <a href={entry.url_subtitle} download target="_blank" rel="noopener noreferrer" class="action-btn" title="Untertitel herunterladen">
              <Icon icon="download" />
            </a>
          </td>
          <td>
            <a
              href={entry.url_subtitle}
              class="action-btn"
              title="Untertitel-URL kopieren"
              onclick={(e) => {
                if (e.button !== 0) return;
                e.preventDefault();
                copyToClipboard('subtitle', entry.url_subtitle as string);
              }}>
              {#if copyStatus.subtitle === 'idle'}
                <Icon icon="link-45deg" />
              {:else if copyStatus.subtitle === 'copied'}
                <Icon icon="check-lg" />
              {:else}
                <Icon icon="x-lg" />
              {/if}
            </a>
          </td>
          {#if showCastButton}<td></td>{/if}
        </tr>
      {/if}
    </tbody>
  </table>
  <div class="legend">
    <span><Icon icon="play-fill" /> Abspielen</span>
    <span><Icon icon="download" /> Download <span class="cursor-help" title="Zum Herunterladen je nach Browser 'Rechtsklick → Speichern unter...' nötig."><Icon icon="info-circle" /></span></span>
    <span><Icon icon="link-45deg" /> URL kopieren</span>
    {#if showCastButton}<span><Icon icon="cast" /> Chromecast</span>{/if}
  </div>
{/if}

<style>
  @reference "../../app.css";

  .video-action-link {
    @apply inline-flex items-center justify-center text-[0.85rem] font-bold rounded bg-gray-200 px-2 py-1 text-gray-700 hover:text-gray-900 dark:bg-gray-700 dark:text-gray-100 dark:hover:text-white cursor-pointer;
  }

  .action-btn {
    @apply inline-flex items-center justify-center p-3 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors;
  }

  .drawer-table {
    @apply border-separate border-spacing-y-1 w-fit;
  }

  .drawer-table td {
    @apply px-1 align-middle;
  }

  .quality-name {
    @apply font-medium text-sm whitespace-nowrap text-right pr-0;
  }

  .quality-name::after {
    content: ' |';
    @apply text-gray-500 dark:text-gray-400;
  }

  .quality-size {
    @apply text-sm whitespace-nowrap text-right pr-3;
  }

  .legend {
    @apply inline-grid grid-cols-2 gap-x-4 gap-y-1 mt-3 text-xs text-gray-500 dark:text-gray-400;
  }

  .legend span {
    @apply inline-flex items-center gap-1;
  }
</style>
