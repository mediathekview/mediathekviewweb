type CastVideoOptions = {
  url: string;
  title: string;
  channel: string;
  topic: string;
};

export type CastConsentChoice = 'cancel' | 'once' | 'always';
type ConsentProvider = () => Promise<CastConsentChoice>;

const CONSENT_TTL_MS = 90 * 24 * 60 * 60 * 1000; // ~ 90 days

export function isChromeBasedBrowser(): boolean {
  return typeof window !== 'undefined' && !!window.chrome;
}

let consentProvider: ConsentProvider | null = null;

export function setCastConsentProvider(provider: ConsentProvider) {
  consentProvider = provider;
}

async function ensureConsent(): Promise<boolean> {
  try {
    if (localStorage.getItem('castConsent') === 'true') {
      // After 90 days ask the user again, to avoid having stale consent from a long time ago.
      const at = parseInt(localStorage.getItem('castConsentAt') ?? '0', 10);
      if (!isNaN(at) && Date.now() - at < CONSENT_TTL_MS) return true;
    }
  } catch {
    /* ignore */
  }

  if (!consentProvider) return false;
  const choice = await consentProvider();
  if (choice === 'cancel') return false;
  if (choice === 'always') {
    try {
      localStorage.setItem('castConsent', 'true');
      localStorage.setItem('castConsentAt', Date.now().toString());
    } catch {
      /* ignore */
    }
  }
  return true;
}

let sdkPromise: Promise<void> | null = null;

function loadSdk(): Promise<void> {
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise<void>((resolve, reject) => {
    window.__onGCastApiAvailable = (isAvail: boolean) => {
      if (!isAvail) {
        reject(new Error('Cast API not available'));
        return;
      }
      const ctx = cast.framework.CastContext.getInstance();
      ctx.setOptions({
        autoJoinPolicy: chrome.cast.AutoJoinPolicy.PAGE_SCOPED,
        receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
      });
      resolve();
    };
    const script = document.createElement('script');
    script.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
    script.setAttribute('data-cast-sdk', '');
    script.onerror = () => reject(new Error('Failed to load Cast SDK'));
    document.head.appendChild(script);
  });
  return sdkPromise;
}

export async function castVideo(opts: CastVideoOptions): Promise<void> {
  if (!(await ensureConsent())) return;

  try {
    await loadSdk();
  } catch (e) {
    console.warn('Chromecast SDK unavailable:', e);
    return;
  }

  const ctx = cast.framework.CastContext.getInstance();
  let session = ctx.getCurrentSession();
  if (!session) {
    try {
      await ctx.requestSession();
    } catch {
      console.warn('No Cast session available or user cancelled the Cast dialog.');
      return;
    }
    session = ctx.getCurrentSession();
  }
  if (!session) return;

  const mediaInfo = new chrome.cast.media.MediaInfo(opts.url, opts.url.endsWith('.m3u8') ? 'application/x-mpegURL' : 'video/mp4');
  const metadata = new chrome.cast.media.GenericMediaMetadata();
  metadata.title = opts.title;
  metadata.subtitle = `${opts.channel} – ${opts.topic}`;
  mediaInfo.metadata = metadata;

  const request = new chrome.cast.media.LoadRequest(mediaInfo);
  request.autoplay = true;

  const err = await session.loadMedia(request);
  // TODO: surface this to the user via a toast/snackbar once such a component exists — currently fails silently from their perspective.
  if (err) console.error('Cast loadMedia error:', err);
}
