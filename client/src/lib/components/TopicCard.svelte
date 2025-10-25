<script lang="ts">
  import { appState } from '$lib/store.svelte';
  import type { Topic, TopicMetaData } from '$lib/types';
  import Drawer from './Drawer.svelte';
  import { onMount } from 'svelte';

  interface Props {
    topic: Topic;
  }

  let { topic }: Props = $props();
  let isDetailsOpen = $state(false);
  let cardElement: HTMLDivElement;
  let hasBeenVisible = $state(false);

  // Throttle map to prevent too many simultaneous requests
  const loadingQueue = new Map<string, Promise<void>>();
  const CONCURRENT_LOADS = 3;
  let activeLoads = 0;

  async function loadTopicMetaData() {
    try {
      const url = topic.sample?.url;
      if (!url || topic.sample?.meta_data) {
        return;
      }

      if (loadingQueue.has(url)) {
        return loadingQueue.get(url);
      }

      // Wait if too many concurrent loads
      while (activeLoads >= CONCURRENT_LOADS) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      activeLoads++;

      const loadPromise = (async () => {
        try {
          const res = await fetch(`/api/meta-data?url=${encodeURIComponent(url)}`);
          if (!res.ok) {
            throw new Error('Failed to fetch metadata');
          }
          const md = await res.json();
          if(topic.sample){
            topic.sample.meta_data = md.data as TopicMetaData;
          }
        } finally {
          activeLoads--;
          loadingQueue.delete(url);
        }
      })();

      loadingQueue.set(url, loadPromise);
      await loadPromise;
    } catch (error) {
      console.log(error);
    }
  }

  onMount(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasBeenVisible) {
            hasBeenVisible = true;
            // Add a small delay to stagger requests
            setTimeout(() => {
              loadTopicMetaData();
              isDetailsOpen = true;
            }, Math.random() * 500); // Random delay 0-500ms
          }
        });
      },
      {
        root: null,
        rootMargin: '50px',
        threshold: 0.1,
      },
    );

    if (cardElement) {
      observer.observe(cardElement);
    }

    return () => {
      if (cardElement) {
        observer.unobserve(cardElement);
      }
    };
  });

  function handleClick(event: MouseEvent | KeyboardEvent) {
    if (event instanceof KeyboardEvent && !['Enter', ' '].includes(event.key)) {
      return;
    }
    if (event instanceof KeyboardEvent && event.key === ' ') {
      event.preventDefault();
    }
    const target = event.target as HTMLElement;
    if (target.closest('a')) {
      return;
    }
    isDetailsOpen = !isDetailsOpen;
    if (isDetailsOpen && !hasBeenVisible) {
      hasBeenVisible = true;
      loadTopicMetaData();
    }
  }

  function topicDetails() {
    appState.selectedTopic = topic.topic;
    appState.selectedChannel = topic.sample?.channel || '';
  }
</script>

<div bind:this={cardElement} class="topic-card" role="button" tabindex="0" onclick={handleClick} onkeydown={handleClick}>
  <div class="flex justify-between item-end">
    <div class="text-lg font-semibold mb-2">{topic.topic}</div>
    <div class="text-sm text-gray-500 dark:text-gray-400 mb-2">
      {topic.docCount.toLocaleString('de-DE')} Folge{topic.docCount !== 1 ? 'n' : ''}
    </div>
  </div>
  <Drawer isOpen={isDetailsOpen}>
    {#snippet children()}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="p-4 rounded-md not-dark:shadow-md cursor-default bg-white dark:bg-gray-800" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
        <div class="flex flex-col gap-2">
          {#if topic.sample && topic.sample.meta_data}
            <img class="mt-0 mb-0" src={topic.sample.meta_data.ogImage?.url} alt={topic.sample.meta_data.ogDescription} />
            <div class="line-clamp-3">{topic.sample.meta_data.ogDescription}</div>
          {:else if hasBeenVisible && !topic.sample?.meta_data}
            <div class="flex items-center justify-center p-4">
              <div class="text-gray-500">Lade Metadaten...</div>
            </div>
          {/if}
          <button type="button" class="button" onclick={topicDetails}> Mehr informationen </button>
        </div>
      </div>
    {/snippet}
  </Drawer>
</div>

<style>
  @reference "../../app.css";
  .topic-card {
    @apply flex-shrink-0 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600
      rounded-lg p-3 min-w-[300px] max-w-[350px] min-h-[100px] max-h-[450px]
      cursor-pointer transition-colors duration-200;
  }
</style>
