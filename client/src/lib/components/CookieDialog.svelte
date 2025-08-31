<script lang="ts">
  import { trackEvent } from '$lib/utils';
  import Button from './Button.svelte';
  import Dialog from './Dialog.svelte';

  let { onConsent, showImpressum, showDatenschutz } = $props<{
    onConsent: (accepted: boolean) => void;
    showImpressum: () => void;
    showDatenschutz: () => void;
  }>();
  let dialog: Dialog;

  export function show() {
    dialog.show();
  }

  export function close() {
    dialog.close();
  }
</script>

<Dialog bind:this={dialog} title="Cookies" icon="cookie">
  <div class="text-gray-600 dark:text-gray-300">
    <p class="mb-4">Diese Website verwendet Cookies für die Darstellung von Werbung. Hierbei werden Daten an Google übertragen.</p>
    <p class="mb-4">
      Nähere Informationen dazu finden Sie in unserer
      <button type="button" class="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 underline font-medium" onclick={showDatenschutz}>Datenschutzerklärung</button>. Klicken Sie auf „Akzeptieren“, um Cookies zu akzeptieren und direkt unsere Website besuchen zu können.
    </p>
    <p class="mb-6">
      <button type="button" class="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 underline font-medium" onclick={showImpressum}>Impressum aufrufen</button>
    </p>
    <div class="mb-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
      Sollten Sie mit den Werbe-Cookies nicht einverstanden sein, bitten wir Sie über eine
      <a class="text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 underline font-medium" href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=BDVH46DLCM7E8&source=url" target="_blank" onclick={() => trackEvent('Click PayPal Link (Cookie-Dialog)')}>Spende</a>
      nachzudenken, um den Weiterbetrieb der Website zu ermöglichen.
    </div>
    <div class="flex justify-end gap-4">
      <Button variant="secondary" onclick={() => onConsent(false)}>Ablehnen</Button>
      <Button variant="success" onclick={() => onConsent(true)}>Akzeptieren</Button>
    </div>
  </div>
</Dialog>
