<script lang="ts">
  import { getChannelColorClasses } from '$lib/utils';

  interface Props extends svelte.elements.HTMLAnchorAttributes {
    channel: string;
  }

  let { channel, class: extraClass = '', ...rest }: Props = $props();

  const colorClasses = $derived(getChannelColorClasses(channel));
</script>

<a title={`Website von ${channel} besuchen`} class="channel-tag {colorClasses} {extraClass}" {...rest}>
  {channel}
</a>

<style>
  @reference "../../app.css";

  .channel-tag {
    @apply inline-block rounded px-2.5 py-0.5 text-xs font-medium transition-colors duration-250;
  }
</style>
