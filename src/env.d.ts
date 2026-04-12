/// <reference types="astro/client" />

// Alpine.js <template x-for> in Astro templates is valid HTML but
// astro/astro-jsx.d.ts omits <template> from IntrinsicElements, causing
// Astro's TS checker to treat it as void (no closing tag allowed).
// This adds the element with open-ended attribute support.
declare global {
  namespace astroHTML {
    namespace JSX {
      interface IntrinsicElements {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        template: Record<string, any>;
      }
    }
  }

  // Alpine.js is loaded via CDN in BaseLayout — declare it as a global
  // so <script> blocks can reference Alpine without import
  const Alpine: import("alpinejs").Alpine;

  interface Window {
    __API_URL__?: string;
    Alpine: import("alpinejs").Alpine;
  }
}

export {};
