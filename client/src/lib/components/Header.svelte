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
  let aboutMenuMobileOpen = $state(false);

  function handleAboutClick(type: 'impressum' | 'datenschutz') {
    aboutMenuOpen = false;
    aboutMenuMobileOpen = false;
    mobileMenuOpen = false;
    if (type === 'impressum') showImpressum();
    if (type === 'datenschutz') showDatenschutz();
  }

  function handleMenuClick(action: () => void) {
    mobileMenuOpen = false;
    action();
  }
</script>

<nav class="bg-white dark:bg-gray-800 not-dark:shadow-sm">
  <div id="nav-container" class="max-w-7xl mx-auto px-1.5 sm:px-4 lg:px-6">
    <div class="flex items-center justify-end md:justify-between py-4">
      <a id="logo" class="hidden md:block text-xl font-bold text-gray-900 dark:text-white" href="/">MediathekViewWeb</a>

      <!-- Desktop Menu -->
      <div class="hidden md:flex md:items-center">
        <ul class="flex flex-row items-center gap-2">
          <li>
            <button class="nav-link" onclick={showDonate}>Spenden</button>
          </li>
          <li>
            <a class="nav-link" target="_blank" href="https://forum.mediathekview.de/category/11/offizeller-client-mediathekviewweb" onclick={() => trackEvent('Click Forum Link')}>Forum</a>
          </li>
          <li>
            <button class="nav-link" onclick={showContact}>Kontakt</button>
          </li>
          <li>
            <a class="nav-link" target="_blank" href="https://github.com/mediathekview/mediathekviewweb" onclick={() => trackEvent('Click GitHub Link')}>GitHub</a>
          </li>
          <li class="relative">
            <button class="nav-link flex gap-2 items-center" type="button" onclick={() => (aboutMenuOpen = !aboutMenuOpen)}>
              Über <Icon icon="chevron-down" />
            </button>
            {#if aboutMenuOpen}
              <div class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-10" role="menu" aria-orientation="vertical">
                <button class="dropdown-item w-full text-left" onclick={() => handleAboutClick('impressum')}>Impressum</button>
                <button class="dropdown-item w-full text-left" onclick={() => handleAboutClick('datenschutz')}>Datenschutz</button>
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
        <li>
          <button class="nav-link" onclick={() => handleMenuClick(showDonate)}>Spenden</button>
        </li>
        <li>
          <a
            class="nav-link"
            target="_blank"
            href="https://forum.mediathekview.de/category/11/offizeller-client-mediathekviewweb"
            onclick={() => {
              trackEvent('Click Forum Link');
              mobileMenuOpen = false;
            }}>Forum</a>
        </li>
        <li>
          <button class="nav-link" onclick={() => handleMenuClick(showContact)}>Kontakt</button>
        </li>
        <li>
          <a
            class="nav-link"
            target="_blank"
            href="https://github.com/mediathekview/mediathekviewweb"
            onclick={() => {
              trackEvent('Click GitHub Link');
              mobileMenuOpen = false;
            }}>GitHub</a>
        </li>
        <li>
          <button class="nav-link" onclick={() => handleAboutClick('impressum')}>Impressum</button>
        </li>
        <li>
          <button class="nav-link" onclick={() => handleAboutClick('datenschutz')}>Datenschutz</button>
        </li>
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
