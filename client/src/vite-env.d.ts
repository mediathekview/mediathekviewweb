/// <reference types="svelte" />
/// <reference types="vite/client" />

interface Window {
  __onGCastApiAvailable?: (isAvailable: boolean) => void;
}
