<script lang="ts">
  import Dialog from './Dialog.svelte';
  import Icon from './Icon.svelte'; // Import Icon component for the close button

  let dialog: Dialog;

  export function show() {
    dialog.show();
  }
</script>

<Dialog bind:this={dialog} class="max-w-2xl">
  <div class="text-gray-300">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-white">Kontakt</h1>
      <button class="text-gray-400 hover:text-white cursor-pointer" onclick={() => dialog.close()} aria-label="Close">
        <Icon icon="x-lg" size="base" />
      </button>
    </div>
    <div class="space-y-6">
      <p>
        Für gefundene Fehler oder Verbesserungsvorschläge verwende bitte die
        <a class="text-sky-400 hover:text-sky-300 font-medium underline" target="_blank" href="https://github.com/mediathekview/mediathekviewweb/issues">Issues auf GitHub</a>.
      </p>
      <p>
        Für fehlende Sendungen gibt es Hilfe
        <a class="text-sky-400 hover:text-sky-300 font-medium underline" target="_blank" href="https://forum.mediathekview.de/">im Forum</a>.
      </p>
      <div>
        <p>Für alles andere oder im Fall, dass du kein GitHub Account hast/willst, schreibe mir eine Mail:</p>
        <a class="block bg-gray-700 hover:bg-gray-600 rounded-lg px-4 py-3 mt-3 text-sky-400 font-medium text-center transition-colors" href="mailto:kontakt@mediathekviewweb.de"> kontakt@mediathekviewweb.de </a>
        <p class="mt-3 text-gray-400 text-base">Bitte keine Anfragen zu fehlenden Sendungen per Mail!</p>
      </div>
    </div>
  </div>
</Dialog>
