<script lang="ts">
  import { onMount } from 'svelte';
  import videojs from 'video.js';
  import type Player from 'video.js/dist/types/player';

  import type { VideoPayload } from '$lib/types';
  import { trackEvent } from '$lib/utils';
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
        player.currentTime(player.duration() * percentage);
        return;
      }

      const key = e.key.toLowerCase();
      switch (key) {
        case ' ':
          e.preventDefault();
          player.paused() ? player.play() : player.pause();
          break;

        case 'arrowleft':
          e.preventDefault();
          player.currentTime(player.currentTime() - 10);
          break;

        case 'arrowright':
          e.preventDefault();
          player.currentTime(player.currentTime() + 10);
          break;

        case 'arrowup':
          e.preventDefault();
          player.volume(Math.min(1, player.volume() + 0.1));
          break;

        case 'arrowdown':
          e.preventDefault();
          player.volume(Math.max(0, player.volume() - 0.1));
          break;

        case 'm':
          player.muted(!player.muted());
          break;

        case 'f':
          player.isFullscreen() ? player.exitFullscreen() : player.requestFullscreen();
          break;

        case 'c': {
          const tracks = player.textTracks();
          for (let i = 0; i < tracks.length; i++) {
            const track = tracks[i];
            if (track.kind === 'captions' || track.kind === 'subtitles') {
              track.mode = track.mode === 'showing' ? 'disabled' : 'showing';
            }
          }
          break;
        }
      }
    }

    window.addEventListener('keydown', handleKeydown);

    dialog.addEventListener('close', () => {
      if (player) {
        player.dispose();
        player = null;
      }

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
    if (videoPayload && videoElement && !player) {
      player = videojs(videoElement, {
        controls: true,
        preload: 'auto',
        fluid: true,
      });
      player.src({ src: videoPayload.url, type: videoPayload.url.endsWith('m3u8') ? 'application/x-mpegURL' : undefined });
    }
  });
</script>

<dialog bind:this={dialog} class="p-0 m-0 bg-transparent max-w-none max-h-none w-full h-full backdrop:bg-black/85 z-[100000]">
  <button onclick={() => dialog.close()} class="absolute top-8 right-8 text-white z-10 cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
    <Icon icon="x-lg" size="3xl" />
  </button>
  <div class="absolute inset-0 flex items-center justify-center">
    <div class="w-11/12 md:w-5/6 lg:w-3/4">
      {#if videoPayload}
        <!-- key={videoPayload.url} ensures the video element is re-created when the source changes -->
        {#key videoPayload.url}
          <!-- svelte-ignore a11y_media_has_caption -->
          <video bind:this={videoElement} class="video-js vjs-default-skin vjs-big-play-centered vjs-16-9 w-full">
            {#if videoPayload.url_subtitle}
              <track kind="captions" src={videoPayload.url_subtitle} default />
            {/if}
          </video>
        {/key}
      {/if}
    </div>
  </div>
</dialog>
