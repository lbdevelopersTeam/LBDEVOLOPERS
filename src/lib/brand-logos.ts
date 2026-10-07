// Asset provenance lives in public/logos/sources.json. No generated initials.
const brands = {
  shopify: { label: 'Shopify', mark: 'shopify', wordmark: 'shopify-wordmark', href: 'https://www.shopify.com/' },
  vercel: { label: 'Vercel', mark: 'vercel', wordmark: 'vercel-wordmark', href: 'https://vercel.com/' },
  netlify: { label: 'Netlify', mark: 'netlify', wordmark: 'netlify', href: 'https://www.netlify.com/' },
  stripe: { label: 'Stripe', mark: 'stripe', wordmark: 'stripe', href: 'https://stripe.com/' },
  cloudflare: { label: 'Cloudflare', mark: 'cloudflare', wordmark: 'cloudflare', href: 'https://www.cloudflare.com/' },
  googlecloud: { label: 'Google Cloud', mark: 'google-cloud', wordmark: 'google-cloud', href: 'https://cloud.google.com/' },
  aws: { label: 'AWS', mark: 'aws', wordmark: 'aws', href: 'https://aws.amazon.com/' },
  openai: { label: 'OpenAI', mark: 'openai-mark', wordmark: 'openai', href: 'https://openai.com/' },
  ebay: { label: 'eBay', mark: 'ebay', wordmark: 'ebay', href: 'https://www.ebay.com/' },
  postgresql: { label: 'PostgreSQL', mark: 'postgresql', wordmark: 'postgresql', href: 'https://www.postgresql.org/' },
  wordpress: { label: 'WordPress', mark: 'wordpress', wordmark: 'wordpress', href: 'https://wordpress.org/' },
  react: { label: 'React', mark: 'react', wordmark: 'react', href: 'https://react.dev/' },
  framer: { label: 'Framer', mark: 'framer', wordmark: 'framer', href: 'https://www.framer.com/' },
  n8n: { label: 'n8n', mark: 'n8n', wordmark: 'n8n', href: 'https://n8n.io/' },
  nextjs: { label: 'Next.js', mark: 'nextjs', wordmark: 'nextjs', href: 'https://nextjs.org/' },
  tailwindcss: { label: 'Tailwind CSS', mark: 'tailwindcss', wordmark: 'tailwindcss', href: 'https://tailwindcss.com/' },
  motion: { label: 'Motion', mark: 'motion', wordmark: 'motion', href: 'https://motion.dev/' },
  nodejs: { label: 'Node.js', mark: 'nodejs', wordmark: 'nodejs', href: 'https://nodejs.org/' },
  bun: { label: 'Bun', mark: 'bun', wordmark: 'bun', href: 'https://bun.sh/' },
  redis: { label: 'Redis', mark: 'redis', wordmark: 'redis', href: 'https://redis.io/' },
  docker: { label: 'Docker', mark: 'docker', wordmark: 'docker', href: 'https://www.docker.com/' },
  kubernetes: { label: 'Kubernetes', mark: 'kubernetes', wordmark: 'kubernetes', href: 'https://kubernetes.io/' },
  supabase: { label: 'Supabase', mark: 'supabase', wordmark: 'supabase', href: 'https://supabase.com/' },
  swift: { label: 'Swift', mark: 'swift', wordmark: 'swift', href: 'https://www.swift.org/' },
  kotlin: { label: 'Kotlin', mark: 'kotlin', wordmark: 'kotlin', href: 'https://kotlinlang.org/' },
  pinecone: { label: 'Pinecone', mark: 'pinecone', wordmark: 'pinecone', href: 'https://www.pinecone.io/' },
  gemini: { label: 'Gemini', mark: 'gemini', wordmark: 'gemini', href: 'https://gemini.google.com/' },
  php: { label: 'PHP', mark: 'php', wordmark: 'php', href: 'https://www.php.net/' },
  laravel: { label: 'Laravel', mark: 'laravel', wordmark: 'laravel', href: 'https://laravel.com/' },
  mysql: { label: 'MySQL', mark: 'mysql', wordmark: 'mysql', href: 'https://www.mysql.com/' },
} as const;

export function getBrandLogo(name: string) {
  let key = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (key === 'shopifyplus' || key === 'shopifyecom') key = 'shopify';
  if (/^react(?:\d.*|native)?$/.test(key)) key = 'react';
  if (/^nextjs\d*$/.test(key)) key = 'nextjs';
  if (key === 'framermotion') key = 'motion';
  if (key === 'tailwind') key = 'tailwindcss';
  if (key === 'node') key = 'nodejs';
  if (key === 'k8s') key = 'kubernetes';
  if (key === 'postgres') key = 'postgresql';
  if (key === 'openaigemini') key = 'openai';
  return brands[key as keyof typeof brands] ?? null;
}

// Resolve every named tool in combined cards, without branding generic terms
// like "Vector" or guessing marks for unknown CMS content.
export function getTechnologyLogos(name: string) {
  const matched = name.split(/\s*\/\s*/).flatMap(part => {
    const brand = getBrandLogo(part);
    if (!brand) return [];
    return [brand];
  });
  return matched.filter((brand, index) => matched.findIndex(other => other.mark === brand.mark) === index);
}
