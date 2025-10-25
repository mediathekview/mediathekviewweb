<script lang="ts">
  import { appState } from '$lib/store.svelte';
  import { metadataLoader } from '$lib/metadataLoader';
  import type { Topic, TopicMetaData } from '$lib/types';

  interface Props {
    topic: Topic;
    useIntersectionObserver?: boolean;
  }

  let { topic, useIntersectionObserver = true }: Props = $props();
  let cardElement: HTMLDivElement;
  let hasBeenVisible = $state(false);

  async function loadTopicMetaData() {
    try {
      const url = topic.sample?.url;
      if (!url || topic.sample?.meta_data) {
        return;
      }
      const metadata = await metadataLoader.loadMetadata(url);
      if (topic.sample) {
        topic.sample.meta_data = metadata as TopicMetaData;
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Separate effect for immediate loading
  $effect(() => {
    if (!useIntersectionObserver) {
      // Access topic to make this effect reactive to topic changes
      const currentTopic = topic;
      
      // Load immediately with a small random delay to stagger requests
      setTimeout(() => {
        loadTopicMetaData();
      }, Math.random() * 500);
    }
  });

  // Separate effect for intersection observer
  $effect(() => {
    if (useIntersectionObserver && cardElement) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !hasBeenVisible) {
              hasBeenVisible = true;
              setTimeout(() => {
                loadTopicMetaData();
              }, Math.random() * 500);
            }
          });
        },
        {
          root: null,
          rootMargin: '50px',
          threshold: 0.1,
        }
      );

      observer.observe(cardElement);

      return () => {
        observer.unobserve(cardElement);
      };
    }
  });

  function topicDetails() {
    appState.selectedTopic = topic.topic;
    appState.selectedChannel = topic.sample?.channel || '';
    appState.query = `!${appState.selectedChannel} #${appState.selectedTopic.replaceAll(' ', '_')}`
    appState.currentView = 'search'
  }
</script>

<div bind:this={cardElement} class="topic-card">
  <div class="flex justify-between item-end">
    <div class="text-lg font-semibold mb-2">{topic.topic}</div>
    <div class="text-sm self-center text-gray-500 dark:text-gray-400 mb-2">
      {topic.docCount.toLocaleString('de-DE')} Folge{topic.docCount !== 1 ? 'n' : ''}
    </div>
  </div>
  
  <!-- Always visible metadata block -->
  <div class="metadata-block">
    {#if topic.sample && topic.sample.meta_data && !topic.sample.meta_data.message}
      <img class="mt-0 mb-2 rounded" src={topic.sample.meta_data.ogImage?.url} alt={topic.sample.meta_data.ogDescription} />
      <div class="line-clamp-4 text-base text-gray-600 dark:text-gray-300 mb-2">
        {topic.sample.meta_data.ogDescription}
      </div>
    {:else if topic.sample?.meta_data?.message}
      <div class="flex items-center justify-center p-4">
        <div class="text-gray-400 text-sm">{topic.sample?.meta_data?.message}</div>
      </div>
    {:else}
      <div class="flex items-center justify-center p-4">
        <div class="text-gray-500">Lade Metadaten...</div>
      </div>
    {/if}
  </div>

  <button type="button" class="button w-full mt-2" onclick={topicDetails}>
    Mehr Informationen
  </button>
</div>

<style>
  @reference "../../app.css";
  
  .topic-card {
    @apply flex flex-col justify-between bg-gray-50 dark:bg-gray-700 
      rounded-lg p-3 min-w-[300px] max-w-[350px]
      transition-colors duration-200;
  }

  .metadata-block {
    @apply flex flex-col justify-between;
    min-height: 100px;
  }

  .metadata-block img {
    @apply w-full h-auto object-cover max-h-[200px];
  }
</style>