<script lang="ts">
  import { appState } from '$lib/store.svelte';
  import type { Channel } from '$lib/types';
  import ChannelTag from './ChannelTag.svelte';
  import TopicCard from './TopicCard.svelte';
  
  let { entry, index } = $props<{
    entry: Channel;
    index: number;
  }>();
  
  const { channel, totalTopics, totalUniqueTopics } = entry;
  
  let scrollContainer: HTMLDivElement;
  
  function handleWheel(event: WheelEvent) {
    if (!scrollContainer) return;
    
    // Convert vertical scroll to horizontal scroll
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      event.preventDefault();
      scrollContainer.scrollLeft += event.deltaY;
    }
  }

  function channelSelect() {
    appState.currentView = 'topics'
    appState.selectedChannel = channel
    appState.query = `!${channel}`
  }
</script>

<div class="result-card">
  <div class="p-3">
    <div class="flex justify-between items-start mb-2">
      <div class="text-xl font-bold text-gray-900 dark:text-white">{channel}</div>
      <ChannelTag {channel} class="mt-1 font-semibold text-lg no-underline" />
    </div>
    <div 
      bind:this={scrollContainer}
      class="topics-scroller"
      onwheel={handleWheel}
      role="list"
    >
      {#each entry.topics as topic}
        <TopicCard {topic} />
      {/each}

      <div class="view-all-card">
        <button  type="button" class="button"  onclick={channelSelect} >Weitere Themen finden </button>
      </div>
    </div>

    <div class="flex justify-between item-end">
      <div class="text-sm self-center text-gray-500 dark:text-gray-400">
        {totalTopics.toLocaleString('de-DE')} / {totalUniqueTopics.toLocaleString('de-DE')} Themen
      </div>
      <button type="button" class="button" onclick={channelSelect}>Alle Themen durchstöbern</button>
    </div>
  </div>
</div>

<style>
  @reference "../../app.css";
  
  .result-card {
    @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-none;
  }
  
  .topics-scroller {
    @apply flex gap-3 overflow-x-auto pb-2;
    scroll-behavior: smooth;
    scrollbar-width: thin;
    scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
  }
  
  .topics-scroller::-webkit-scrollbar {
    height: 6px;
  }
  
  .topics-scroller::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .topics-scroller::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 3px;
  }
  
  .topics-scroller::-webkit-scrollbar-thumb:hover {
    background-color: rgba(156, 163, 175, 0.7);
  }
  
  .view-all-card {
    @apply flex-shrink-0  dark:bg-blue-900/30
           rounded-lg p-3 min-w-[200px] max-w-[250px] 
           flex items-center justify-center cursor-pointer
           transition-colors duration-200
           border-2 border-blue-200 dark:border-blue-700
           text-blue-700 dark:text-blue-300 no-underline;
  }
</style>