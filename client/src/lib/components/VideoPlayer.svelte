<script lang="ts">
  import { onMount } from 'svelte';
  import videojs from 'video.js';
  import type Player from 'video.js/dist/types/player';

  import type { VideoPayload } from '$lib/types';
  import { trackEvent } from '$lib/utils';
  import ChannelTag from './ChannelTag.svelte';
  import Icon from './Icon.svelte';

  let { videoPayload, onClose } = $props<{ videoPayload: VideoPayload | null; onClose: () => void }>();

  let dialog: HTMLDialogElement;
  let videoElement = $state<HTMLVideoElement>();
  let player: Player | null = null;
  let playStartTimestamp = 0;

  $effect(() => {
    if (videoPayload && dialog && !dialog.open) {
      dialog.showModal();
      playStartTimestamp = Date.now();
    }
  });

  onMount(() => {
    function handleKeydown(e: KeyboardEvent) {
      // Only act when the video dialog is open and a video is present.
      if (!dialog.open || !player || player.isDisposed()) {
        return;
      }

      // Do not trigger hotkeys if Ctrl, Alt or Meta keys are pressed, to avoid conflicts with browser shortcuts.
      if (e.altKey || e.ctrlKey || e.metaKey) {
        return;
      }

      const target = e.target as HTMLElement;
      // Prevent shortcuts when a text input field is focused.
      if (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        return;
      }

      // Handle number keys 0-9 for jumping to a percentage of the video
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();

        const percentage = parseInt(e.key) / 10;
        const duration = Number(player.duration());

        if (!Number.isNaN(duration)) {
          player.currentTime(duration * percentage);
        }

        return;
      }

      const key = e.key.toLowerCase();
      switch (key) {
        case ' ':
          e.preventDefault();
          player.paused() ? player.play() : player.pause();
          break;

        case 'arrowleft': {
          e.preventDefault();

          const currentTime = Number(player.currentTime());

          if (!Number.isNaN(currentTime)) {
            player.currentTime(currentTime - 10);
          }

          break;
        }

        case 'arrowright': {
          e.preventDefault();

          const currentTime = Number(player.currentTime());

          if (!Number.isNaN(currentTime)) {
            player.currentTime(currentTime + 10);
          }

          break;
        }

        case 'arrowup': {
          e.preventDefault();

          const currentVolume = Number(player.volume());

          if (!Number.isNaN(currentVolume)) {
            player.volume(Math.min(1, currentVolume + 0.1));
          }

          break;
        }

        case 'arrowdown': {
          e.preventDefault();

          const currentVolume = Number(player.volume());

          if (!Number.isNaN(currentVolume)) {
            player.volume(Math.max(0, currentVolume - 0.1));
          }

          break;
        }

        case 'm': {
          player.muted(!player.muted());
          break;
        }

        case 'f': {
          player.isFullscreen() ? player.exitFullscreen() : player.requestFullscreen();
          break;
        }
      }
    }

    window.addEventListener('keydown', handleKeydown);

    dialog.addEventListener('close', () => {
      const playDuration = Date.now() - playStartTimestamp;

      if (playDuration >= 3000) {
        trackEvent('Close Video', { playDuration: Math.floor(playDuration / 1000) });
      }

      if (playDuration >= 30000) {
        location.reload();
      }
      onClose();
    });

    dialog.addEventListener('cancel', (e) => {
      if (player?.isFullscreen()) {
        e.preventDefault();
        player.exitFullscreen();
      }
    });

    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  });

  $effect(() => {
    if (videoPayload && videoElement) {
      const p = videojs(videoElement, {
        controls: true,
        preload: 'auto',
        fluid: true,
        autoplay: true,
        enableSmoothSeeking: true,
        skipButtons: true,
      });

      player = p;

      p.src({ src: videoPayload.url, type: videoPayload.url.endsWith('m3u8') ? 'application/x-mpegURL' : undefined });

      return () => {
        if (p && !p.isDisposed()) {
          p.dispose();
        }

        player = null;
      };
    }
  });
</script>

<dialog bind:this={dialog} class="px-[4vw] bg-transparent max-w-none max-h-none w-full h-full backdrop:bg-black/85">
  <button onclick={() => dialog.close()} class="absolute top-8 right-8 text-white z-10 cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
    <Icon icon="x-lg" size="3xl" />
  </button>

  {#if videoPayload}
    <div class="max-w-[calc(3/5*100%+6rem)] h-full m-auto py-12 space-y-8">
      <div>
        <ChannelTag href={videoPayload.url_website} target="_blank" rel="noopener noreferrer" channel={videoPayload.channel} class="text-base!" />
        <div class="mt-4 text-gray-50/80">{videoPayload.topic}</div>
        <div class="text-lg font-semibold">{videoPayload.title}</div>
      </div>

      <!-- key={videoPayload.url} ensures the video element is re-created when the source changes -->
      {#key videoPayload.url}
        <!-- svelte-ignore a11y_media_has_caption -->
        <video-js bind:this={videoElement} class="vjs-big-play-centered w-full rounded-lg overflow-clip">
          {#if videoPayload.url_subtitle}
            <track kind="captions" src={videoPayload.url_subtitle} default />
          {/if}
        </video-js>
      {/key}
    </div>
  {/if}
</dialog>
