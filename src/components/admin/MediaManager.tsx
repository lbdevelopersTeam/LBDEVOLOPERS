import { useCallback, useEffect, useState } from 'react';
import { Copy, Check, Eye, Trash2, Images, Sparkles } from 'lucide-react';
import { fetchJson } from '../../lib/content';
import { cn } from '../../lib/utils';
import MediaUploadButton from './MediaUploadButton';
import { AdminModal, ConfirmModal } from './AdminModal';

interface MediaAsset {
  id: string;
  original_name: string;
  public_url: string;
  mime_type: string;
  byte_size: number;
  alt_text: string;
  created_at: string;
}

const fieldClass =
  'w-full rounded-xl border border-white/10 bg-[#08080c] px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none transition focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10';

export default function MediaManager() {
  const [items, setItems] = useState<MediaAsset[]>([]);
  const [altText, setAltText] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState('');

  // Modals state
  const [deleteTarget, setDeleteTarget] = useState<MediaAsset | null>(null);
  const [previewTarget, setPreviewTarget] = useState<MediaAsset | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setItems((await fetchJson<{ items: MediaAsset[] }>('/api/v2/admin/media?limit=100')).items);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to load media.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await fetchJson(`/api/v2/admin/media/${deleteTarget.id}`, { method: 'DELETE' });
      setNotice(`Media "${deleteTarget.original_name}" was successfully deleted.`);
      await refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to delete media.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const copyUrl = (id: string, url: string) => {
    void navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Upload Banner & Alt description box */}
      <div className="relative overflow-hidden rounded-[2rem] border border-brand-primary/20 bg-gradient-to-br from-brand-primary/10 via-[#0d0e15]/80 to-[#08080c] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-primary/15 blur-3xl" />
        
        <div className="relative z-10 grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-brand-primary">
              <Sparkles className="h-4 w-4" /> Cloud Media Storage
            </div>
            <h3 className="font-display text-2xl font-black text-white sm:text-3xl">Upload & Optimize Assets</h3>
            <p className="max-w-xl text-sm leading-relaxed text-white/50">
              Upload ultra high-resolution screenshots, portfolios, hero artwork, or client PDFs. Images are safely compressed to WebP format.
            </p>
            
            <div className="pt-2">
              <label className="space-y-1.5 block">
                <span className="text-[9px] font-black uppercase tracking-[0.26em] text-white/40">
                  Default Accessible Alt Text (Optional)
                </span>
                <input
                  value={altText}
                  disabled={uploading}
                  onChange={(event) => setAltText(event.target.value)}
                  className={fieldClass}
                  maxLength={500}
                  placeholder="e.g. Modern responsive dashboard interface showcase"
                />
              </label>
            </div>
          </div>

          <div className="flex flex-col items-start gap-2">
            <MediaUploadButton
              label="Select & Upload Files"
              kind="image-or-pdf"
              altText={altText}
              disabled={loading || uploading}
              onUploadingChange={setUploading}
              onUpload={async () => {
                setError('');
                setAltText('');
                setNotice('Media uploaded and indexed successfully.');
                await refresh();
              }}
            />
          </div>
        </div>
      </div>

      {/* Notice feedback alerts */}
      {(notice || error) && (
        <div
          role="status"
          className={cn(
            'flex items-center justify-between rounded-2xl border px-5 py-4 text-sm backdrop-blur-xl transition-all',
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

      {/* Grid of uploaded media */}
      {items.length === 0 && !loading ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-[2rem] border border-dashed border-white/10 bg-white/[0.015] p-12 text-center">
          <Images className="mb-4 h-10 w-10 text-white/20" />
          <p className="text-base font-bold text-white/60">No media assets in library</p>
          <p className="mt-1 text-xs text-white/30">Upload photos, logos, or documents to manage them here.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0d14]/80 shadow-lg transition-all duration-300 hover:border-brand-primary/30 hover:bg-[#10121d] hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
            >
              {/* Media Thumbnail Container */}
              <div
                className="relative aspect-[16/10] w-full cursor-pointer overflow-hidden bg-black/40"
                onClick={() => setPreviewTarget(item)}
              >
                {item.mime_type.startsWith('image/') ? (
                  <img
                    src={item.public_url}
                    alt={item.alt_text || item.original_name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-brand-primary/5 font-display">
                    <span className="rounded-xl border border-brand-primary/20 bg-brand-primary/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-brand-primary">
                      PDF Document
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 backdrop-blur-xs transition-opacity group-hover:opacity-100">
                  <span className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-md">
                    <Eye className="h-3.5 w-3.5" /> Preview
                  </span>
                </div>
              </div>

              {/* Card Meta & Actions */}
              <div className="flex flex-1 flex-col justify-between space-y-3 p-4">
                <div>
                  <h4 className="truncate text-xs font-bold text-white/90" title={item.original_name}>
                    {item.original_name}
                  </h4>
                  <div className="mt-1 flex items-center justify-between text-[10px] font-semibold text-white/35">
                    <span>{item.mime_type.split('/')[1]?.toUpperCase() || item.mime_type}</span>
                    <span>{(item.byte_size / 1024).toFixed(1)} KB</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => copyUrl(item.id, item.public_url)}
                    className={cn(
                      'inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-wider transition-all',
                      copiedId === item.id
                        ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
                        : 'border-white/10 bg-white/[0.03] text-white/60 hover:border-brand-primary/30 hover:bg-brand-primary/10 hover:text-white'
                    )}
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> Copy URL
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/40 transition hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-400"
                    aria-label={`Delete ${item.original_name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Custom Confirm Deletion Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Media Asset"
        message={`Are you sure you want to permanently remove "${deleteTarget?.original_name}" from the media storage? Any public references to this URL may break.`}
        confirmText="Delete File"
        tone="danger"
      />

      {/* Custom Media Preview Modal */}
      <AdminModal
        isOpen={Boolean(previewTarget)}
        onClose={() => setPreviewTarget(null)}
        title={previewTarget?.original_name || 'Media Preview'}
        subtitle={`${previewTarget?.mime_type} · ${previewTarget ? (previewTarget.byte_size / 1024).toFixed(1) : 0} KB`}
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="flex max-h-[60vh] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/60 p-2">
            {previewTarget?.mime_type.startsWith('image/') ? (
              <img
                src={previewTarget.public_url}
                alt={previewTarget.alt_text || previewTarget.original_name}
                className="max-h-[55vh] w-auto max-w-full rounded-xl object-contain"
              />
            ) : (
              <div className="p-12 text-center">
                <p className="font-display text-lg font-bold text-white">PDF Document Ready</p>
                <a
                  href={previewTarget?.public_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex rounded-xl bg-brand-primary px-5 py-2.5 text-xs font-bold text-white"
                >
                  Open in New Tab
                </a>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <span className="block text-[9px] font-black uppercase tracking-widest text-white/40">Direct Asset Link</span>
              <p className="truncate font-mono text-xs text-brand-primary">{previewTarget?.public_url}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (previewTarget) copyUrl(previewTarget.id, previewTarget.public_url);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/20"
            >
              <Copy className="h-4 w-4" /> Copy Link
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
