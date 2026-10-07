import { describe, expect, it } from 'vitest';
import { getBrandLogo, getTechnologyLogos } from './brand-logos';

describe('brand logos', () => {
  it('uses local original assets for all infrastructure-strip brands', () => {
    for (const name of ['AWS', 'Shopify', 'Google Cloud', 'Vercel', 'Netlify', 'Stripe', 'Cloudflare', 'OpenAI', 'eBay', 'PostgreSQL']) {
      const brand = getBrandLogo(name);
      expect(brand).not.toBeNull();
      expect(brand?.wordmark).toBeTruthy();
      expect(brand?.href).toMatch(/^https:\/\//);
    }
  });
  it('resolves existing content names without inventing a logo', () => {
    expect(getBrandLogo('React 18+')?.mark).toBe('react');
    expect(getBrandLogo('React Native')?.mark).toBe('react');
    expect(getBrandLogo('Shopify Plus')?.mark).toBe('shopify');
    expect(getBrandLogo('Framer websites')).toBeNull();
    expect(getBrandLogo('Framer Motion')?.mark).toBe('motion');
    expect(getBrandLogo('Unrecognized future tool')).toBeNull();
  });
  it('covers every technology card, including versions and combined tools', () => {
    const cases = {
      'Next.js 14': ['nextjs'], 'Next.js 15.2': ['nextjs'],
      'Tailwind CSS': ['tailwindcss'], 'Framer Motion': ['motion'],
      'Node.js / Bun': ['nodejs', 'bun'], Redis: ['redis'],
      'Docker / K8s': ['docker', 'kubernetes'], Supabase: ['supabase'],
      'Swift / Kotlin': ['swift', 'kotlin'], 'Pinecone / Vector': ['pinecone'],
      'OpenAI / Gemini': ['openai-mark', 'gemini'],
      PHP: ['php'], Laravel: ['laravel'], MySQL: ['mysql'], WordPress: ['wordpress'],
    };
    for (const [name, marks] of Object.entries(cases)) {
      expect(getTechnologyLogos(name).map(brand => brand.mark), name).toEqual(marks);
    }
    expect(getTechnologyLogos('Unknown custom CMS tool')).toEqual([]);
    expect(getBrandLogo('Reactive invented tool')).toBeNull();
  });
});
