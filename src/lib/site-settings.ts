import { useEffect, useState } from 'react';
import { AGENCY_EMAIL, cachedPublicFetch } from './public-api';

interface PublicSettings {
  'site.contact_email'?: unknown;
}

export function useContactEmail() {
  const [email, setEmail] = useState(AGENCY_EMAIL);

  useEffect(() => {
    let active = true;
    void cachedPublicFetch<PublicSettings>('/api/v2/settings', 'public.settings.v2', { 'site.contact_email': AGENCY_EMAIL }).then((settings) => {
      const configured = settings['site.contact_email'];
      if (active && typeof configured === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(configured)) setEmail(configured);
    });
    return () => { active = false; };
  }, []);

  return email;
}
