<script lang="ts">
  type IconSize = '0' | 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';

  const sizeMap: Record<IconSize, string> = {
    '0': 'text-[0]',
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
    '6xl': 'text-6xl',
  };

  /**
   * Defines the component's props. It extends standard HTML attributes for a <span>
   * to allow passing through attributes like `title`, `aria-label`, etc.
   */
  interface Props {
    /** The name of the Bootstrap icon (e.g., "search", "heart-fill"). */
    icon: string;
    /** The size of the icon. If not provided, it defaults to `text-base`. */
    size?: IconSize;
    /** The path to the Bootstrap Icons SVG sprite file. */
    svgPath?: string;
    /** Additional CSS classes to apply to the component. */
    class?: string;
  }

  let { icon, size, svgPath = '/assets/bootstrap-icons.svg', class: extraClass = '', ...rest }: Props = $props();

  const url = $derived(`${svgPath}#${icon}`);
  const sizeClass = $derived(size ? sizeMap[size] : 'text-base');
</script>

<!--
  The component is wrapped in a <span> styled as an inline-flex container.
  This makes it easy to align and size, behaving like a single character of text.
  - `text-inherit` ensures it adopts the color of its parent.
  - `text-base` provides a default size, which can be overridden by the `size` prop.
  - Any additional classes are passed through.
-->
<span class={`inline-flex items-center text-inherit ${sizeClass} ${extraClass}`} {...rest}>
  <!--
    The SVG element's dimensions are set to `1em`, so it scales relative to the
    font-size of the parent <span>.
    `fill="currentColor"` makes the icon's color match the text color.
  -->
  <svg fill="currentColor" style="width: 1em; aspect-ratio: 1;">
    <use href={url} />
  </svg>
</span>
