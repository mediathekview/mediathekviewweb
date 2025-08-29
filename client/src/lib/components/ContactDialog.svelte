<script lang="ts">
  import Dialog from './Dialog.svelte';

  let dialog: Dialog;

  export function show() {
    dialog.show();
  }
</script>

<Dialog bind:this={dialog} title="Kontakt" icon="envelope-at" onclose={() => dialog.close()} class="max-w-2xl">
  <div class="space-y-6">
    <p>
      Für gefundene Fehler oder Verbesserungsvorschläge verwende bitte die
      <a class="text-sky-500 hover:text-sky-300 font-medium underline" target="_blank" href="https://github.com/mediathekview/mediathekviewweb/issues">Issues auf GitHub</a>.
    </p>
    <p>
      Für fehlende Sendungen gibt es Hilfe
      <a class="text-sky-500 hover:text-sky-300 font-medium underline" target="_blank" href="https://forum.mediathekview.de/">im Forum</a>.
    </p>
    <div>
      <p>Für alles andere oder im Fall, dass du kein GitHub Account hast/willst, schreibe mir eine Mail:</p>
      <a class="block bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg px-4 py-3 mt-3 text-sky-500 font-medium text-center transition-colors" href="mailto:kontakt@mediathekviewweb.de"> kontakt@mediathekviewweb.de </a>
      <p class="mt-3 text-gray-600 dark:text-gray-300 text-base">Bitte keine Anfragen zu fehlenden Sendungen per Mail!</p>
    </div>
  </div>
</Dialog>
