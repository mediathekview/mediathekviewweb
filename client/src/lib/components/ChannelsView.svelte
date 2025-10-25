<script lang="ts">
  import { appState } from "$lib/store.svelte";
  import ChannelCard from "./ChannelCard.svelte";

  let error = $state<string | null>(null);

  $effect(() => {
    (async () => {
      try {
        await appState.loadChannels()
      } catch (e: any) {
        error = e.message;
      }
    })();
  });
</script>

<div class="w-full">
  {#if error}
    <p>Fehler beim Laden der Daten: {error}</p>
  {:else if appState.channels.length}
  <div class="grid grid-cols-2 gap-4">
    {#each appState.channels as channel, index}
    <ChannelCard entry={channel} isDetailsOpen={false}  index={index} />
    {/each}
  </div>
  {:else}
    <p>Lade Daten...</p>
  {/if}
</div>
