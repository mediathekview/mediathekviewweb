<script lang="ts">
  import ContactDialog from '$lib/components/ContactDialog.svelte';
  import CookieDialog from '$lib/components/CookieDialog.svelte';
  import Datenschutz from '$lib/components/Datenschutz.svelte';
  import Dialog from '$lib/components/Dialog.svelte';
  import DonateDialog from '$lib/components/DonateDialog.svelte';
  import Header from '$lib/components/Header.svelte';
  import Impressum from '$lib/components/Impressum.svelte';
  import ResultsContainer from '$lib/components/ResultsContainer.svelte';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import VideoPlayer from '$lib/components/VideoPlayer.svelte';
  import { appState } from '$lib/store.svelte';
  import type { VideoPayload } from '$lib/types';
  import { initializeAnalytics, trackEvent } from '$lib/utils';
  import { onMount } from 'svelte';
  import { MediaQuery } from 'svelte/reactivity';

  let cookieDialog: CookieDialog;
  let contactDialog: ContactDialog;
  let donateDialog: DonateDialog;
  let mainElement: HTMLElement;
  let legalDialog = $state<Dialog>();

  let videoToPlay = $state<VideoPayload | null>(null);
  let pageToView = $state<'datenschutz' | 'impressum' | null>(null);

  const prefersDark = new MediaQuery('(prefers-color-scheme: dark)');

  $effect(() => {
    document.documentElement.classList.toggle('dark', prefersDark.current);
  });

  $effect(() => {
    const mainClassList = document.querySelector('main')?.classList;
    const navContainerClassList = document.querySelector('#nav-container')?.classList;
    if (mainClassList && navContainerClassList) {
      const isList = appState.viewMode === 'list';
      mainClassList.toggle('max-w-screen-2xl', isList);
      mainClassList.toggle('max-w-7xl', !isList);
      navContainerClassList.toggle('max-w-screen-2xl', isList);
      navContainerClassList.toggle('max-w-7xl', !isList);
    }
  });

  $effect(() => {
    // Scroll to top when changing the pagination page.
    appState.currentPage;
    mainElement?.scrollIntoView({ behavior: 'instant' });
  });

  $effect(() => {
    if (pageToView) {
      legalDialog?.show();
    } else {
      legalDialog?.close();
    }
  });

  function showImpressum() {
    pageToView = 'impressum';
  }

  function showDatenschutz() {
    pageToView = 'datenschutz';
  }

  onMount(() => {
    // Remove the browser warning now that JS is running
    document.getElementById('browserWarning')?.remove();

    initializeAnalytics();

    // This now correctly starts the reactive effects and returns a cleanup function
    const destroyStore = appState.init();

    // Cookie consent
    try {
      const allowCookies = localStorage.getItem('allowCookies');
      const lastAsked = parseInt(localStorage.getItem('allowCookiesAsked') || '0', 10);
      // Re-ask for consent after 7 days if it was denied previously.
      if (allowCookies === 'true') {
        addAdSense();
      } else if (allowCookies !== 'false' || isNaN(lastAsked) || lastAsked < Date.now() - 7 * 24 * 60 * 60 * 1000) {
        cookieDialog.show();
      }
    } catch (e) {
      console.warn('Could not access localStorage. Ads will not be shown.', e);
    }

    // This function will be called when the component is unmounted
    return () => {
      destroyStore();
    };
  });

  function addAdSense() {
    const adsense = document.createElement('script');
    adsense.type = 'text/javascript';
    adsense.setAttribute('data-ad-client', 'ca-pub-2430783446079517');
    adsense.async = true;
    adsense.crossOrigin = 'anonymous';
    adsense.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
    document.head.appendChild(adsense);
  }

  function handleCookieConsent(accepted: boolean) {
    trackEvent('Cookie Consent', { consent: accepted ? 'accept' : 'deny' });
    try {
      localStorage.setItem('allowCookies', String(accepted));
      localStorage.setItem('allowCookiesAsked', Date.now().toString());
    } catch (e) {
      /* ignore */
    }

    cookieDialog.close();

    if (accepted) {
      addAdSense();
    }
  }
</script>

<div class:blur={!!videoToPlay}>
  <Header showContact={() => contactDialog.show()} showDonate={() => donateDialog.show()} {showImpressum} {showDatenschutz} />

  <main bind:this={mainElement} class="mx-auto py-6 px-4 sm:px-6 lg:px-8">
    <div>
      <SearchBar />
      <ResultsContainer onPlayVideo={(payload) => (videoToPlay = payload)} />
    </div>
  </main>
</div>

<VideoPlayer videoPayload={videoToPlay} onClose={() => (videoToPlay = null)} />
<CookieDialog bind:this={cookieDialog} onConsent={handleCookieConsent} {showImpressum} {showDatenschutz} />
<ContactDialog bind:this={contactDialog} />
<DonateDialog bind:this={donateDialog} />

{#if pageToView}
  <Dialog bind:this={legalDialog} limitWidth={false} title={pageToView === 'impressum' ? 'Impressum' : 'Datenschutzerklärung'} icon={pageToView === 'impressum' ? 'person-lines-fill' : 'shield-shaded'} onclose={() => (pageToView = null)} class="max-w-4xl">
    <div class="max-h-[70vh] overflow-y-auto -mx-6 -my-8 md:-mx-8 p-6 md:p-8">
      {#if pageToView === 'impressum'}
        <Impressum />
      {:else if pageToView === 'datenschutz'}
        <Datenschutz />
      {/if}
    </div>
  </Dialog>
{/if}

<style>
  @reference "./app.css";

  .blur {
    filter: blur(3px) !important;
    transition: all 0.4s ease-in-out;
  }
</style>
