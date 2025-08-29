<script lang="ts">
  interface Props extends svelte.elements.HTMLAnchorAttributes {
    channel: string;
  }

  let { channel, class: extraClass = '', ...rest }: Props = $props();

  const channelClasses = new Map([
    ['3sat', 'bg-[#eb0a28] text-white'],
    ['ard-alpha', 'bg-[#dc4f27] text-white'],
    ['ard', 'bg-[#003181] text-white'],
    ['arte.de', 'bg-[#fa471c] text-white'],
    ['arte.en', 'bg-[#fa471c] text-white'],
    ['arte.es', 'bg-[#fa471c] text-white'],
    ['arte.fr', 'bg-[#fa471c] text-white'],
    ['arte.it', 'bg-[#fa471c] text-white'],
    ['arte.pl', 'bg-[#fa471c] text-white'],
    ['br', 'bg-[#006aff] text-white'],
    ['dw', 'bg-white text-[#05b2fc]'],
    ['funk.net', 'bg-[#a953f6] text-white'],
    ['hr', 'bg-[#007396] text-white'],
    ['kika', 'bg-[#005b63] text-[#ffec14]'],
    ['mdr', 'bg-[#0062ae] text-white'],
    ['ndr', 'bg-[#0c1754] text-white'],
    ['one', 'channel-one'],
    ['orf', 'bg-[#d4231c] text-white'],
    ['phoenix', 'bg-[#00687c] text-white'],
    ['radio bremen tv', 'bg-[#bd0000] text-white'],
    ['rbb', 'bg-[#e31818] text-white'],
    ['rbtv', 'bg-[#e60007] text-white'],
    ['sr', 'bg-[#007796] text-white'],
    ['srf', 'bg-[#af001d] text-white'],
    ['swr', 'bg-white text-[#201a40]'],
    ['tagesschau24', 'bg-[#003372] text-white'],
    ['wdr', 'bg-[#00345e] text-white'],
    ['zdf-tivi', 'bg-[#fa7d19] text-white'],
    ['zdf', 'bg-[#fa7d19] text-white'],
    ['zdfinfo', 'bg-white text-[#ff7f02]'],
    ['zdfneo', 'bg-black text-white'],
  ]);

  const defaultChannelClasses = 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300';

  export function getChannelColorClasses(channel: string): string {
    return channelClasses.get(channel.toLowerCase()) ?? defaultChannelClasses;
  }

  const colorClasses = $derived(getChannelColorClasses(channel));
</script>

<a title={`Website von ${channel} besuchen`} class="channel-tag {colorClasses} {extraClass}" {...rest}>
  {channel}
</a>

<style>
  @reference "../../app.css";

  .channel-tag {
    @apply inline-block rounded px-2.5 py-0.5 text-xs font-bold transition-colors duration-250 overflow-clip;
    text-shadow: 0px 0px 5px rgba(0, 0, 0, 0.5);
  }

  .channel-one {
    @apply relative bg-clip-text text-transparent dark:text-shadow-none!;

    background-image: linear-gradient(160deg, #f6c617 0%, #f6c617 23.49%, #f4bd20 28.31%, #eea639 36.26%, #e38062 46.38%, #d54b9b 58.25%, #c50ddd 70.54%, #c50ddd 100%);
    text-shadow: 0px 0px 10px rgba(0, 0, 0, 0.15);
  }
</style>
