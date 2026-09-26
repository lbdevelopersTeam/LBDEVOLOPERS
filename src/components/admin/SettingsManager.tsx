import { useCallback, useEffect, useState } from 'react';
import { Edit3, Save, Settings, Sparkles } from 'lucide-react';
import { fetchJson } from '../../lib/content';
import { cn } from '../../lib/utils';

interface Setting {
  key: string;
  value: unknown;
  is_public: boolean;
  description: string;
}

const fieldClass =
  'w-full rounded-xl border border-white/10 bg-[#090a0f] px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10';
const labelClass = 'block text-[9px] font-black uppercase tracking-[0.24em] text-white/40';

export default function SettingsManager() {
  const [items, setItems] = useState<Setting[]>([]);
  const [key, setKey] = useState('');
  const [value, setValue] = useState('""');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setItems((await fetchJson<{ items: Setting[] }>('/api/v2/admin/settings')).items);
      setError('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to load settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setNotice('');
    let parsed: unknown;
    try {
      parsed = JSON.parse(value);
    } catch {
      setError('The setting value must be valid JSON (for plain text, include quotation marks: "your text").');
      return;
    }
    setLoading(true);
    try {
      await fetchJson(`/api/v2/admin/settings/${encodeURIComponent(key)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: parsed, isPublic, description }),
      });
      setNotice(`Setting "${key}" saved successfully.`);
      setKey('');
      setValue('""');
      setDescription('');
      setIsPublic(false);
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to save setting.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#0c0d14]/80 p-6 shadow-xl backdrop-blur-xl sm:p-8">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-brand-primary">
          <Settings className="h-4 w-4" /> Global Site Parameters
        </div>
        <h3 className="mt-2 font-display text-2xl font-black text-white sm:text-3xl">Website Settings</h3>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">
          Configure public agency metadata, contact information, social handles, and SEO parameters. Sensitive system credentials remain safely isolated in backend environment variables.
        </p>
      </div>

      {(notice || error) && (
        <div
          role="status"
          className={cn(
            'flex items-center justify-between rounded-2xl border px-5 py-4 text-sm backdrop-blur-xl',
            error ? 'border-red-500/30 bg-red-500/10 text-red-300' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
          )}
        >
          <span>{error || notice}</span>
          <button
            type="button"
            onClick={() => {
              setNotice('');
              setError('');
            }}
            className="text-xs uppercase tracking-wider opacity-60 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-[440px_minmax(0,1fr)]">
        {/* Form */}
        <form
          onSubmit={save}
          className="h-fit space-y-4 rounded-[2rem] border border-white/[0.08] bg-[#0c0d14]/90 p-6 shadow-xl backdrop-blur-xl sm:p-7"
        >
          <h3 className="border-b border-white/[0.07] pb-4 font-display text-xl font-black uppercase text-white">
            {key ? 'Edit Setting' : 'New Setting'}
          </h3>

          <div className="space-y-1.5">
            <label className={labelClass}>Setting Key</label>
            <input
              required
              pattern="[a-z0-9_.-]+"
              value={key}
              onChange={(event) => setKey(event.target.value.toLowerCase())}
              className={cn(fieldClass, 'font-mono')}
              placeholder="e.g. agency.contact_email"
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>JSON Value</label>
            <textarea
              required
              rows={7}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className={cn(fieldClass, 'font-mono text-xs leading-relaxed')}
              placeholder='"value" or {"key": "val"}'
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className={fieldClass}
              placeholder="Description of what this setting controls..."
            />
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/70">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(event) => setIsPublic(event.target.checked)}
              className="h-4 w-4 rounded accent-brand-primary"
            />
            Expose via Public API
          </label>

          <button
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(61,90,254,0.3)] transition hover:bg-brand-primary/90 disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> Save Setting
          </button>
        </form>

        {/* Setting items list */}
        <div className="space-y-3">
          {items.map((item) => (
            <article
              key={item.key}
              className="flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-[#0c0d14]/80 p-5 shadow-lg transition-all duration-200 hover:border-white/15 hover:bg-[#10121e] sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <h4 className="truncate font-mono text-sm font-bold text-brand-primary">{item.key}</h4>
                  <span
                    className={cn(
                      'rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-wider',
                      item.is_public ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-white/40'
                    )}
                  >
                    {item.is_public ? 'Public' : 'Private'}
                  </span>
                </div>
                <div className="rounded-xl border border-white/5 bg-black/40 p-3 font-mono text-xs text-white/70">
                  <p className="line-clamp-3 break-all">{JSON.stringify(item.value, null, 2)}</p>
                </div>
                {item.description && <p className="text-xs text-white/40">{item.description}</p>}
              </div>

              <button
                type="button"
                onClick={() => {
                  setKey(item.key);
                  setValue(JSON.stringify(item.value, null, 2));
                  setDescription(item.description || '');
                  setIsPublic(item.is_public);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex h-9 w-9 shrink-0 items-center justify-center self-start rounded-xl border border-white/10 bg-white/[0.03] text-white/50 transition hover:border-brand-primary/40 hover:bg-brand-primary/10 hover:text-brand-primary sm:self-center"
                aria-label={`Edit ${item.key}`}
              >
                <Edit3 className="h-4 w-4" />
              </button>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
