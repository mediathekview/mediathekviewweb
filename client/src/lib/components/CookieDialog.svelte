<script lang="ts">
  import Button from './Button.svelte';
  import Dialog from './Dialog.svelte';

  let { onConsent } = $props<{ onConsent: (accepted: boolean) => void }>();
  let dialog: Dialog;

  export function show() {
    dialog.show();
  }

  export function close() {
    dialog.close();
  }
</script>

<Dialog bind:this={dialog} title="Cookies">
  <div class="prose max-w-none text-slate-600 dark:prose-invert dark:text-slate-300">
    <p>
      Diese Website verwendet Cookies für die Darstellung von Werbung. Hierbei werden Daten an Google übertragen. Nähere Informationen dazu finden Sie in unserer
      <a target="_blank" href="/datenschutz">Datenschutzerklärung</a>. Klicken Sie auf „Akzeptieren“, um Cookies zu akzeptieren und direkt unsere Website besuchen zu können.
    </p>
    <p><a target="_blank" href="/impressum">Impressum aufrufen</a></p>
    <p>
      Sollten Sie mit den Werbe-Cookies nicht einverstanden sein, bitten wir Sie über eine
      <a href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=BDVH46DLCM7E8&source=url" target="_blank">Spende</a>
      nachzudenken, um den Weiterbetrieb der Website zu ermöglichen.
    </p>
  </div>
  <div class="flex gap-4 mt-6">
    <Button variant="secondary" onclick={() => onConsent(false)}>Ablehnen</Button>
    <Button variant="success" onclick={() => onConsent(true)}>Akzeptieren</Button>
  </div>
</Dialog>
