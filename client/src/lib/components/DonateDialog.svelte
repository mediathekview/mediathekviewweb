<script lang="ts">
  import Dialog from './Dialog.svelte';
  import Icon from './Icon.svelte';

  let dialog: Dialog;

  export function show() {
    dialog.show();
  }
</script>

<Dialog bind:this={dialog} title="Spenden" onclose={() => dialog.close()}>
  <p class="text-lg text-slate-600 dark:text-slate-300 mb-6">Du möchtest dem Entwickler von MediathekView<b>Web</b> danken und ihm eine Pizza zahlen?</p>
  <div class="space-y-4">
    <a class="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out gap-2" target="_blank" href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=BDVH46DLCM7E8&source=url">
      <Icon icon="paypal" />
      Per PayPal senden
    </a>
    <div class="text-center text-slate-500 dark:text-slate-400">
      <p>oder</p>
    </div>
    <div class="text-center text-slate-500 dark:text-slate-400 text-base">
      <p>Überweisung auf Anfrage per E-Mail an</p>
      <a class="text-gray-800 dark:text-white font-semibold hover:underline" href="mailto:kontakt@mediathekviewweb.de">kontakt@mediathekviewweb.de</a>
    </div>
  </div>
</Dialog>
