import { useEffect } from 'react';

export interface SeoOptions {
  title: string;
  description: string;
  image?: string;
  canonicalPath?: string;
  schema?: Record<string, unknown>;
}

const upsertMeta = (selector: string, attribute: 'name' | 'property', key: string, content: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
};

export function useSeo({ title, description, image, canonicalPath, schema }: SeoOptions) {
  useEffect(() => {
    document.title = title;
    upsertMeta('meta[name="description"]', 'name', 'description', description);
    upsertMeta('meta[property="og:title"]', 'property', 'og:title', title);
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', description);
    upsertMeta('meta[property="og:type"]', 'property', 'og:type', 'website');

    if (image) {
      upsertMeta('meta[property="og:image"]', 'property', 'og:image', new URL(image, window.location.origin).href);
    } else {
      document.head.querySelector('meta[property="og:image"]')?.remove();
    }

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = new URL(canonicalPath || window.location.pathname, window.location.origin).href;

    const existingSchema = document.head.querySelector<HTMLScriptElement>('script[data-lb-schema]');
    existingSchema?.remove();
    if (schema) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.lbSchema = 'true';
      script.text = JSON.stringify(schema).replace(/</g, '\\u003c');
      document.head.appendChild(script);
    }

    return () => document.head.querySelector<HTMLScriptElement>('script[data-lb-schema]')?.remove();
  }, [canonicalPath, description, image, schema, title]);
}
