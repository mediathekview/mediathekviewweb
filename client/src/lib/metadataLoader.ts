type MetadataCache = Map<string, any>;
type LoadingQueue = Map<string, Promise<void>>;

class MetadataLoader {
  private cache: MetadataCache = new Map();
  private loadingQueue: LoadingQueue = new Map();
  private activeLoads = 0;
  private readonly CONCURRENT_LOADS = 3;

  async loadMetadata(url: string): Promise<any> {
    // Return from cache if available
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }

    // Return existing promise if already loading
    if (this.loadingQueue.has(url)) {
      return this.loadingQueue.get(url);
    }

    // Wait if too many concurrent loads
    while (this.activeLoads >= this.CONCURRENT_LOADS) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    this.activeLoads++;

    const loadPromise = (async () => {
      try {
        const res = await fetch(`/api/meta-data?url=${encodeURIComponent(url)}`);
        if (!res.ok) {
          throw new Error('Failed to fetch metadata');
        }
        const md = await res.json();
        this.cache.set(url, md.data);
        return md.data;
      } catch (error) {
        console.error('Error loading metadata:', error);
        // Cache error state to prevent retry storms
        const errorResult = { message: 'Fehler beim Laden' };
        this.cache.set(url, errorResult);
        return errorResult;
      } finally {
        this.activeLoads--;
        this.loadingQueue.delete(url);
      }
    })();

    this.loadingQueue.set(url, loadPromise);
    return loadPromise;
  }

  clearCache() {
    this.cache.clear();
  }
}

export const metadataLoader = new MetadataLoader();