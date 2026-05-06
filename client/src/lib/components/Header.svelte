<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';
  import { trackEvent } from '$lib/utils';

  let { showContact, showDonate, showImpressum, showDatenschutz } = $props<{
    showContact: () => void;
    showDonate: () => void;
    showImpressum: () => void;
    showDatenschutz: () => void;
  }>();

  let mobileMenuOpen = $state(false);
  let aboutMenuOpen = $state(false);

  type NavItem = { type: 'button'; label: string; event: string; action: () => void } | { type: 'link'; label: string; event: string; href: string };

  const navItems: NavItem[] = [
    { type: 'button', label: 'Spenden', event: 'Click Donate', action: showDonate },
    { type: 'link', label: 'Forum', event: 'Click Forum Link', href: 'https://forum.mediathekview.de/category/11/offizeller-client-mediathekviewweb' },
    { type: 'button', label: 'Kontakt', event: 'Click Contact', action: showContact },
    { type: 'link', label: 'GitHub', event: 'Click GitHub Link', href: 'https://github.com/mediathekview/mediathekviewweb' },
  ];

  const aboutItems: { label: string; key: 'impressum' | 'datenschutz' }[] = [
    { label: 'Impressum', key: 'impressum' },
    { label: 'Datenschutz', key: 'datenschutz' },
  ];

  function clickOutside(node: HTMLElement, callback: () => void) {
    function handle(e: MouseEvent) {
      if (!node.contains(e.target as Node)) callback();
    }

    window.addEventListener('click', handle, true);

    return {
      destroy() {
        window.removeEventListener('click', handle, true);
      },
    };
  }

  function handleAboutClick(key: 'impressum' | 'datenschutz') {
    aboutMenuOpen = false;
    mobileMenuOpen = false;
    if (key === 'impressum') {
      trackEvent('View Impressum');
      showImpressum();
    } else {
      trackEvent('View Datenschutz');
      showDatenschutz();
    }
  }
</script>

{#snippet navItem(item: NavItem, closeMobile: boolean)}
  {#if item.type === 'link'}
    <a
      class="nav-link"
      target="_blank"
      href={item.href}
      onclick={() => {
        trackEvent(item.event);
        if (closeMobile) mobileMenuOpen = false;
      }}>{item.label}</a>
  {:else}
    <button
      class="nav-link"
      onclick={() => {
        trackEvent(item.event);
        if (closeMobile) mobileMenuOpen = false;
        item.action();
      }}>{item.label}</button>
  {/if}
{/snippet}

<nav class="bg-white dark:bg-gray-800 not-dark:shadow-sm" aria-label="Hauptnavigation">
  <div id="nav-container" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between py-4">
      <h1 class="text-xl font-bold text-gray-900 dark:text-white m-0">
        <a id="logo" href="/">MediathekViewWeb</a>
      </h1>

      <!-- Desktop Menu -->
      <div class="hidden md:flex md:items-center">
        <ul class="flex flex-row items-center gap-2">
          {#each navItems as item}
            <li>{@render navItem(item, false)}</li>
          {/each}
          <li class="relative" use:clickOutside={() => (aboutMenuOpen = false)}>
            <button class="nav-link flex gap-2 items-center" type="button" onclick={() => (aboutMenuOpen = !aboutMenuOpen)}>
              Über <Icon icon="chevron-down" />
            </button>
            {#if aboutMenuOpen}
              <div class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-10" role="menu" aria-orientation="vertical">
                {#each aboutItems as item}
                  <button class="dropdown-item w-full text-left" onclick={() => handleAboutClick(item.key)}>{item.label}</button>
                {/each}
              </div>
            {/if}
          </li>
        </ul>
      </div>

      <!-- Mobile Burger Button -->
      <div class="md:hidden leading-1">
        <button onclick={() => (mobileMenuOpen = !mobileMenuOpen)} class="rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white cursor-pointer" type="button" aria-controls="mobile-menu" aria-expanded={mobileMenuOpen}>
          <Icon icon={mobileMenuOpen ? 'x-lg' : 'list'} size={mobileMenuOpen ? 'xl' : '2xl'} />
        </button>
      </div>
    </div>
  </div>

  <!-- Mobile Menu -->
  {#if mobileMenuOpen}
    <div class="md:hidden" id="mobile-menu">
      <ul class="px-2 pb-3 space-y-1">
        {#each navItems as item}
          <li>{@render navItem(item, true)}</li>
        {/each}
        {#each aboutItems as item}
          <li><button class="nav-link" onclick={() => handleAboutClick(item.key)}>{item.label}</button></li>
        {/each}
      </ul>
    </div>
  {/if}
</nav>

<style>
  @reference "../../app.css";

  .nav-link {
    @apply cursor-pointer rounded-md px-3 py-2 text-lg md:text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white;
  }

  .dropdown-item {
    @apply block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600;
  }
</style>
