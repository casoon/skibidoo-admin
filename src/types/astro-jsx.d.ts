// Ambient declaration (no imports/exports at file level) so TypeScript
// treats this as namespace merging, not module augmentation.
// Adds <template> to Astro's IntrinsicElements so x-for doesn't cause
// "HTML element 'template' has no corresponding closing tag" errors.
declare namespace astroHTML.JSX {
  interface IntrinsicElements {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    template: Record<string, any>;
  }
}
