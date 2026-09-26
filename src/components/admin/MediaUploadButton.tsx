import { useRef, useState } from 'react';
import { ImagePlus, LoaderCircle, UploadCloud } from 'lucide-react';
import { optimizeImage, uploadAdminMedia } from '../../lib/content';
import type { AdminMediaUpload } from '../../lib/content';
import { cn } from '../../lib/utils';

type UploadKind = 'image' | 'pdf' | 'image-or-pdf';

interface MediaUploadButtonProps {
  label: string;
  onUpload: (uploads: AdminMediaUpload[]) => void | Promise<void>;
  altText?: string;
  kind?: UploadKind;
  multiple?: boolean;
  square?: boolean;
  maxFiles?: number;
  disabled?: boolean;
  onUploadingChange?: (uploading: boolean) => void;
  className?: string;
}

const maxUploadBytes = 10 * 1024 * 1024;
const maxSourceImageBytes = 50 * 1024 * 1024;
const isImageFile = (file: File) => file.type.startsWith('image/') && file.type !== 'image/svg+xml';

const acceptFor = (kind: UploadKind) => kind === 'image'
  ? 'image/*'
  : kind === 'pdf'
    ? 'application/pdf,.pdf'
    : 'image/*,application/pdf,.pdf';

export default function MediaUploadButton({
  label,
  onUpload,
  altText = '',
  kind = 'image',
  multiple = false,
  square = false,
  maxFiles = multiple ? 20 : 1,
  disabled = false,
  onUploadingChange,
  className,
}: MediaUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState('');

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const files = selectedFiles.filter((file, index) => selectedFiles.findIndex((candidate) => `${candidate.name}:${candidate.size}:${candidate.lastModified}` === `${file.name}:${file.size}:${file.lastModified}`) === index);
    if (!files.length) return;
    setError('');

    if (files.length > maxFiles) {
      setError(`Select no more than ${maxFiles} ${maxFiles === 1 ? 'file' : 'files'} at once.`);
      event.target.value = '';
      return;
    }

    const invalidType = files.find((file) => {
      const allowedImage = isImageFile(file) && kind !== 'pdf';
      const allowedPdf = file.type === 'application/pdf' && kind !== 'image';
      return !allowedImage && !allowedPdf;
    });
    if (invalidType) {
      setError(invalidType.type === 'image/svg+xml' ? 'SVG uploads are disabled for security. Choose a raster image such as PNG, JPEG, WebP, GIF, AVIF, or BMP.' : `Unsupported file format: ${invalidType.name}. Choose a browser-compatible image${kind !== 'image' ? ' or PDF' : ''}.`);
      event.target.value = '';
      return;
    }
    const invalidSize = files.find((file) => file.size < 1 || file.size > (isImageFile(file) ? maxSourceImageBytes : maxUploadBytes));
    if (invalidSize) {
      setError(invalidSize.size < 1 ? `${invalidSize.name} is empty.` : `File exceeds maximum source size: ${invalidSize.name}. Images may be up to 50 MB; PDFs may be up to 10 MB.`);
      event.target.value = '';
      return;
    }

    setUploading(true);
    setProgress({ current: 1, total: files.length });
    onUploadingChange?.(true);
    const uploaded: AdminMediaUpload[] = [];
    let delivered = false;
    try {
      for (const [index, file] of files.entries()) {
        setProgress({ current: index + 1, total: files.length });
        let uploadFile = file;
        if (isImageFile(file)) {
          let optimized = await optimizeImage(file, square ? 2200 : 2560, square ? 2200 : 2560);
          if (optimized.size > maxUploadBytes) optimized = await optimizeImage(file, 1920, 1920, 0.72);
          if (optimized.size > maxUploadBytes) throw new Error(`${file.name} could not be compressed below the secure 10 MB storage limit.`);
          uploadFile = new File([optimized], `${file.name.replace(/\.[^.]+$/, '')}.webp`, { type: 'image/webp' });
        }
        uploaded.push(await uploadAdminMedia(uploadFile, altText));
      }
      delivered = true;
      await onUpload(uploaded);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'The upload could not be completed.';
      if (uploaded.length && !delivered) {
        try {
          await onUpload(uploaded);
          setError(`${message} ${uploaded.length} ${uploaded.length === 1 ? 'file was' : 'files were'} uploaded successfully.`);
        } catch (callbackError) {
          setError(callbackError instanceof Error ? callbackError.message : message);
        }
      } else {
        setError(message);
      }
    } finally {
      setUploading(false);
      setProgress({ current: 0, total: 0 });
      onUploadingChange?.(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <label className={cn(
        'inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/55 transition',
        uploading ? 'cursor-wait opacity-60' : disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer hover:border-brand-primary/30 hover:text-white',
      )}>
        {uploading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : kind === 'pdf' ? <UploadCloud className="h-4 w-4" aria-hidden="true" /> : <ImagePlus className="h-4 w-4" aria-hidden="true" />}
        {uploading ? progress.total > 1 ? `Uploading ${progress.current} of ${progress.total}...` : 'Uploading file...' : label}
        <input
          ref={inputRef}
          type="file"
          accept={acceptFor(kind)}
          multiple={multiple}
          disabled={uploading || disabled}
          className="sr-only"
          onChange={handleChange}
        />
      </label>
      {uploading && <p role="status" aria-live="polite" className="text-xs text-white/40">The file is being optimized, stored, and verified. Keep this page open.</p>}
      {!uploading && kind !== 'pdf' && <p className="max-w-md text-[11px] leading-relaxed text-white/30">Any resolution or aspect ratio. Browser-compatible raster images up to 50 MB are resized only when needed and stored as optimized WebP without cropping.{kind === 'image-or-pdf' ? ' PDFs up to 10 MB are also supported.' : ''}</p>}
      {!uploading && kind === 'pdf' && <p className="max-w-md text-[11px] leading-relaxed text-white/30">PDF documents up to 10 MB are supported.</p>}
      {error && <p role="alert" className="max-w-sm text-xs leading-relaxed text-red-300">{error}</p>}
    </div>
  );
}
