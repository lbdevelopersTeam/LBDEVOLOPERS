import { getBrandLogo } from '../../lib/brand-logos';

type Props = {
  name: string;
  className?: string;
  variant?: 'mark' | 'wordmark';
  decorative?: boolean;
};

export default function BrandLogo({ name, className = '', variant = 'mark', decorative = true }: Props) {
  const brand = getBrandLogo(name);
  // Unknown CMS entries keep their readable name; never invent a brand mark.
  if (!brand) return null;
  return <img
    src={`/logos/${brand[variant]}.svg`}
    alt={decorative ? '' : brand.label}
    aria-hidden={decorative ? true : undefined}
    width={128}
    height={128}
    decoding="async"
    className={`brand-logo brand-logo--${brand.mark} ${className}`}
  />;
}
