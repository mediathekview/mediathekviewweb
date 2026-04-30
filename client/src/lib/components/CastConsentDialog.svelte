<script lang="ts">
  import type { CastConsentChoice } from '$lib/cast';
  import Button from './Button.svelte';
  import Dialog from './Dialog.svelte';

  let dialog: Dialog;
  let resolver: ((choice: CastConsentChoice) => void) | null = null;

  export function show(onChoice: (choice: CastConsentChoice) => void) {
    if (resolver) {
      onChoice('cancel');
      return;
    }
    resolver = onChoice;
    dialog.show();
  }

  function choose(choice: CastConsentChoice) {
    const r = resolver;
    resolver = null;
    dialog.close();
    r?.(choice);
  }
</script>

<Dialog bind:this={dialog} title="Google Cast" icon="cast" onclose={() => resolver && choose('cancel')}>
  <p class="mb-6 text-gray-600 dark:text-gray-300">Für die Nutzung von <i>Google Cast (Chromecast)</i> muss ein externer Inhalt von Google eingebunden werden.</p>
  <div class="flex flex-wrap justify-end gap-3">
    <Button variant="secondary" onclick={() => choose('cancel')}>Abbrechen</Button>
    <Button variant="secondary" onclick={() => choose('once')}>Fortfahren</Button>
    <Button variant="success" onclick={() => choose('always')}>Fortfahren und nicht mehr fragen</Button>
  </div>
</Dialog>
