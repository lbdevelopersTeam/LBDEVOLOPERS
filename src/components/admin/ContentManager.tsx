import { useCallback, useEffect, useMemo, useState } from 'react';
import { Edit3, Save, Search, Trash2, Plus, Sparkles, X, CheckCircle2 } from 'lucide-react';
import { fetchJson, slugify, tagsFromString } from '../../lib/content';
import { cn } from '../../lib/utils';
import MediaUploadButton from './MediaUploadButton';
import { ConfirmModal } from './AdminModal';

type Resource = 'services' | 'testimonials' | 'technologies' | 'skills';
type FieldKind = 'text' | 'textarea' | 'number' | 'checkbox' | 'tags' | 'url';
type FormValue = string | number | boolean | string[] | null;
type FormState = Record<string, FormValue>;
type Row = Record<string, unknown> & { id: string };

interface Field {
  key: string;
  label: string;
  kind?: FieldKind;
  required?: boolean;
}

interface ResourceConfig {
  singular: string;
  fields: Field[];
  empty: FormState;
  title: (row: Row) => string;
  subtitle: (row: Row) => string;
  toForm?: (row: Row) => FormState;
}

const fieldClass =
  'w-full rounded-xl border border-white/10 bg-[#090a0f] px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10';
const labelClass = 'block text-[9px] font-black uppercase tracking-[0.26em] text-white/40';

const configs: Record<Resource, ResourceConfig> = {
  services: {
    singular: 'Service',
    empty: {
      title: '',
      slug: '',
      shortDescription: '',
      description: '',
      image: '',
      mediaId: null,
      icon: '',
      features: [],
      featured: false,
      active: true,
      displayOrder: 0,
      metaTitle: '',
      metaDescription: '',
    },
    fields: [
      { key: 'title', label: 'Service name', required: true },
      { key: 'slug', label: 'Slug' },
      { key: 'shortDescription', label: 'Short description', kind: 'textarea' },
      { key: 'description', label: 'Full description', kind: 'textarea' },
      { key: 'image', label: 'Image URL', kind: 'url' },
      { key: 'icon', label: 'Icon name' },
      { key: 'features', label: 'Features (comma separated)', kind: 'tags' },
      { key: 'displayOrder', label: 'Display order', kind: 'number' },
      { key: 'metaTitle', label: 'SEO title' },
      { key: 'metaDescription', label: 'SEO description', kind: 'textarea' },
      { key: 'featured', label: 'Featured', kind: 'checkbox' },
      { key: 'active', label: 'Published', kind: 'checkbox' },
    ],
    title: (row) => String(row.title || ''),
    subtitle: (row) => `${String(row.slug || '')} · ${row.active ? 'Published' : 'Hidden'}`,
  },
  testimonials: {
    singular: 'Testimonial',
    empty: {
      quote: '',
      author: '',
      role: '',
      company: '',
      project: '',
      avatar: '',
      avatarMediaId: null,
      teamMemberId: null,
      serviceId: null,
      featured: false,
      active: true,
      displayOrder: 0,
    },
    fields: [
      { key: 'author', label: 'Client name', required: true },
      { key: 'role', label: 'Position' },
      { key: 'company', label: 'Company' },
      { key: 'project', label: 'Related project' },
      { key: 'quote', label: 'Testimonial', kind: 'textarea', required: true },
      { key: 'avatar', label: 'Avatar URL', kind: 'url' },
      { key: 'teamMemberId', label: 'Team member ID' },
      { key: 'serviceId', label: 'Service ID' },
      { key: 'displayOrder', label: 'Display order', kind: 'number' },
      { key: 'featured', label: 'Featured', kind: 'checkbox' },
      { key: 'active', label: 'Approved / published', kind: 'checkbox' },
    ],
    title: (row) => String(row.author || ''),
    subtitle: (row) => `${String(row.company || 'Independent')} · ${row.active ? 'Published' : 'Pending'}`,
  },
  technologies: {
    singular: 'Technology',
    empty: { name: '', slug: '', category: 'Technology', iconUrl: '', proficiency: '', description: '' },
    fields: [
      { key: 'name', label: 'Technology name', required: true },
      { key: 'slug', label: 'Slug' },
      { key: 'category', label: 'Category', required: true },
      { key: 'iconUrl', label: 'Icon URL', kind: 'url' },
      { key: 'proficiency', label: 'Proficiency' },
      { key: 'description', label: 'Description', kind: 'textarea' },
    ],
    toForm: (row) => ({
      name: String(row.name || ''),
      slug: String(row.slug || ''),
      category: String(row.category || 'Technology'),
      iconUrl: String(row.icon_url || row.iconUrl || ''),
      proficiency: String(row.proficiency || ''),
      description: String(row.description || ''),
    }),
    title: (row) => String(row.name || ''),
    subtitle: (row) => String(row.category || 'Technology'),
  },
  skills: {
    singular: 'Skill',
    empty: { name: '', slug: '', category: 'General' },
    fields: [
      { key: 'name', label: 'Skill name', required: true },
      { key: 'slug', label: 'Slug' },
      { key: 'category', label: 'Category', required: true },
    ],
    title: (row) => String(row.name || ''),
    subtitle: (row) => String(row.category || 'General'),
  },
};

const normalizeForm = (config: ResourceConfig, row: Row) =>
  config.toForm?.(row) ||
  Object.fromEntries(Object.keys(config.empty).map((key) => [key, (row[key] as FormValue) ?? config.empty[key] ?? '']));

export default function ContentManager() {
  const [resource, setResource] = useState<Resource>('services');
  const [items, setItems] = useState<Row[]>([]);
  const [form, setForm] = useState<FormState>(configs.services.empty);
  const [editingId, setEditingId] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);

  const config = configs[resource];

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchJson<{ items: Row[] }>(`/api/v2/admin/${resource}?limit=100`);
      setItems(data.items);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to load content.');
    } finally {
      setLoading(false);
    }
  }, [resource]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    setForm(config.empty);
    setEditingId('');
    setSearch('');
    setNotice('');
    setError('');
  }, [config, resource]);

  const filtered = useMemo(
    () => items.filter((item) => JSON.stringify(item).toLowerCase().includes(search.toLowerCase())),
    [items, search]
  );

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (uploading) {
      setError('Wait for the image upload to finish before saving.');
      return;
    }
    setError('');
    setNotice('');
    setLoading(true);
    try {
      const payload = { ...form };
      if ('slug' in payload && !payload.slug) {
        payload.slug = slugify(String(payload.title || payload.name || ''));
      }
      await fetchJson(`/api/v2/admin/${resource}${editingId ? `/${editingId}` : ''}`, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setNotice(`${config.singular} saved successfully.`);
      setForm(config.empty);
      setEditingId('');
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : `Unable to save ${config.singular.toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  };

  const confirmArchive = async () => {
    if (!deleteTarget) return;
    setError('');
    setNotice('');
    try {
      await fetchJson(`/api/v2/admin/${resource}/${deleteTarget.id}`, { method: 'DELETE' });
      setNotice(`${config.singular} archived.`);
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to archive content.');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Resource Switcher Bar */}
      <div className="flex flex-col justify-between gap-4 rounded-[2rem] border border-white/[0.08] bg-[#0c0d14]/80 p-4 shadow-xl backdrop-blur-xl sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(configs) as Resource[]).map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setResource(name)}
              className={cn(
                'rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all duration-200',
                resource === name
                  ? 'bg-brand-primary text-white shadow-[0_0_20px_rgba(61,90,254,0.35)]'
                  : 'bg-white/[0.03] text-white/50 hover:bg-white/[0.07] hover:text-white'
              )}
            >
              {name}
            </button>
          ))}
        </div>

        <label className="relative min-w-[240px]">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className={cn(fieldClass, 'pl-11')}
            placeholder={`Search ${resource}...`}
          />
        </label>
      </div>

      {/* Notification status banner */}
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

      {/* Split layout: Form left, Records right */}
      <div className="grid gap-8 xl:grid-cols-[440px_minmax(0,1fr)]">
        {/* Form Card */}
        <form
          onSubmit={save}
          className="h-fit space-y-5 rounded-[2rem] border border-white/[0.08] bg-[#0c0d14]/90 p-6 shadow-xl backdrop-blur-xl sm:p-8"
        >
          <div className="flex items-center gap-3 border-b border-white/[0.07] pb-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
              <Plus className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-xl font-black uppercase text-white">
                {editingId ? `Edit ${config.singular}` : `New ${config.singular}`}
              </h3>
              <p className="mt-0.5 text-xs text-white/40">Catalog entry configuration</p>
            </div>
          </div>

          <div className="space-y-4">
            {config.fields.map((field) => {
              const value = form[field.key];
              if (field.kind === 'checkbox') {
                return (
                  <label
                    key={field.key}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-4 py-3.5 text-sm text-white/70 transition hover:border-brand-primary/30"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(value)}
                      onChange={(event) => setForm({ ...form, [field.key]: event.target.checked })}
                      className="h-4 w-4 rounded accent-brand-primary"
                    />
                    <span className="font-semibold text-white">{field.label}</span>
                  </label>
                );
              }

              const mediaIdField = field.key === 'image' ? 'mediaId' : field.key === 'avatar' ? 'avatarMediaId' : null;
              const isMediaField = Boolean(mediaIdField) || field.key === 'iconUrl';
              const inputId = `${resource}-${field.key}`;

              return (
                <div key={field.key} className="space-y-2">
                  <label htmlFor={inputId} className={labelClass}>
                    {field.label} {field.required && <span className="text-brand-primary">*</span>}
                  </label>
                  {field.kind === 'textarea' ? (
                    <textarea
                      id={inputId}
                      required={field.required}
                      rows={field.key === 'description' || field.key === 'quote' ? 5 : 3}
                      value={String(value ?? '')}
                      onChange={(event) => setForm({ ...form, [field.key]: event.target.value })}
                      className={fieldClass}
                    />
                  ) : (
                    <>
                      <input
                        id={inputId}
                        required={field.required}
                        type={field.kind === 'number' ? 'number' : 'text'}
                        inputMode={field.kind === 'url' ? 'url' : undefined}
                        value={field.kind === 'tags' && Array.isArray(value) ? value.join(', ') : String(value ?? '')}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            [field.key]:
                              field.kind === 'number'
                                ? Number(event.target.value)
                                : field.kind === 'tags'
                                ? tagsFromString(event.target.value)
                                : event.target.value || (field.key.endsWith('Id') ? null : ''),
                            ...(mediaIdField ? { [mediaIdField]: null } : {}),
                          })
                        }
                        className={fieldClass}
                      />
                      {isMediaField && (
                        <div className="mt-2">
                          <MediaUploadButton
                            label={`Upload ${field.label}`}
                            square={field.key === 'avatar' || field.key === 'iconUrl'}
                            disabled={uploading}
                            onUploadingChange={setUploading}
                            onUpload={([upload]) =>
                              setForm((current) => ({
                                ...current,
                                [field.key]: upload.url,
                                ...(mediaIdField ? { [mediaIdField]: upload.id } : {}),
                              }))
                            }
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 border-t border-white/[0.08] pt-5">
            <button
              disabled={loading || uploading}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(61,90,254,0.3)] transition hover:bg-brand-primary/90 disabled:cursor-wait disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> {uploading ? 'Uploading image' : 'Save Record'}
            </button>
            {editingId && (
              <button
                type="button"
                disabled={loading || uploading}
                onClick={() => {
                  setEditingId('');
                  setForm(config.empty);
                }}
                className="rounded-xl border border-white/10 px-5 text-[10px] font-black uppercase tracking-widest text-white/50 transition hover:border-white/20 hover:text-white disabled:opacity-40"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Record Cards List */}
        <div className="space-y-3">
          {loading && items.length === 0 ? (
            <div className="rounded-[2rem] border border-white/10 bg-[#0c0d14]/40 p-12 text-center text-sm text-white/35">
              Loading records...
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-white/10 bg-[#0c0d14]/40 p-12 text-center text-sm text-white/35">
              No matching records found.
            </div>
          ) : (
            filtered.map((item) => (
              <article
                key={item.id}
                className="flex flex-col gap-4 rounded-2xl border border-white/[0.08] bg-[#0c0d14]/80 p-5 shadow-lg transition-all duration-200 hover:border-white/15 hover:bg-[#10121e] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="truncate font-display text-base font-black text-white">{config.title(item)}</h4>
                  <p className="mt-1 truncate text-xs text-white/40">{config.subtitle(item)}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForm(normalizeForm(config, item));
                      setEditingId(item.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/50 transition hover:border-brand-primary/40 hover:bg-brand-primary/10 hover:text-brand-primary"
                    aria-label={`Edit ${config.title(item)}`}
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/50 transition hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-400"
                    aria-label={`Archive ${config.title(item)}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>

      {/* Custom Confirm Archive Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmArchive}
        title={`Archive ${config.singular}`}
        message={`Are you sure you want to archive "${deleteTarget ? config.title(deleteTarget) : ''}"? It will no longer appear on the live site.`}
        confirmText="Archive Record"
        tone="danger"
      />
    </div>
  );
}
