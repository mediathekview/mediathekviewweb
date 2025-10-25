<script lang="ts">
  import { appState } from "$lib/store.svelte";
  import TopicCard from "./TopicCard.svelte";

  let error = $state<string | null>(null);

  $effect(() => {
    (async () => {
      try {
        appState.loadTopics()
      } catch (e: any) {
        error = e.message;
      }
    })();
  });
  
</script>

<div class="prose dark:prose-invert prose-sm max-w-none">
  <div class="flex flex-wrap gap-2 mb-3">
    {#each appState.channelOptions as channel}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="chip" class:active={appState.selectedChannel == channel} onclick={() => {
        appState.selectedChannel = channel
         appState.loadTopics()
      }}>{channel}</div>
    {/each}
  </div>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
    {#each appState.topics as topic}
      <TopicCard {topic} useIntersectionObserver={false}/>
    {/each}
  </div>
  <div class="flex justify-between items-end mt-2">
    <div>
      {#if appState.topicNextAfterKey}
        <button type="button" class="button" onclick={() => appState.loadTopics('')}>Zur ersten Seite</button>
      {/if}
    </div>
    <button type="button" class="button" onclick={() => appState.loadTopics(appState.topicNextAfterKey)}>Nächste Seite</button>
  </div>
</div>
