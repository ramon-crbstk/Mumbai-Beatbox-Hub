import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Loader2, 
  Image as ImageIcon,
  ExternalLink 
} from 'lucide-react';
import { uploadImageToCloudinary, CLOUDINARY_CONFIG } from '../../lib/cloudinary';

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  recommendedAspect?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  value,
  onChange,
  folder = 'mbh_media',
  recommendedAspect = '1:1',
  placeholder = 'https://res.cloudinary.com/... or upload image',
  disabled = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<(() => void) | null>(null);

  const isCloudinaryConfigured = Boolean(CLOUDINARY_CONFIG.cloudName);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset temporary states
    setUploadError(null);
    setUploadSuccessMessage(null);
    setIsUploading(true);
    setUploadProgress(0);

    const result = await uploadImageToCloudinary(file, {
      folder,
      onProgress: (percent) => setUploadProgress(percent),
      onAbortRef: abortRef,
    });

    setIsUploading(false);

    if (result.success && result.secureUrl) {
      onChange(result.secureUrl);
      setUploadSuccessMessage('Uploaded to Cloudinary successfully!');
      setTimeout(() => setUploadSuccessMessage(null), 4000);
    } else {
      // Do NOT erase the existing value if replacement upload failed
      setUploadError(result.error || 'Failed to upload image to Cloudinary.');
    }

    // Reset input value so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancelUpload = () => {
    if (abortRef.current) {
      abortRef.current();
    }
    setIsUploading(false);
    setUploadProgress(0);
  };

  const handleClearUrl = () => {
    onChange('');
    setUploadError(null);
    setUploadSuccessMessage(null);
  };

  return (
    <div className="space-y-2 font-mono text-xs">
      <div className="flex items-center justify-between">
        <label className="block text-[#F4EFE4]/80 uppercase font-semibold">
          {label}
        </label>
        <span className="text-[10px] text-[#F4EFE4]/50">
          Target: Cloudinary &bull; {recommendedAspect}
        </span>
      </div>

      {/* Cloudinary Configuration Warning (if missing cloudName) */}
      {!isCloudinaryConfigured && (
        <div className="p-2.5 bg-[#FFC93C]/10 border border-[#FFC93C]/40 text-[#FFC93C] text-[11px] flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Cloudinary Setup Notice:</span>
            Add <code className="bg-[#14120F] px-1 py-0.5 text-white">VITE_CLOUDINARY_CLOUD_NAME</code> and{' '}
            <code className="bg-[#14120F] px-1 py-0.5 text-white">VITE_CLOUDINARY_UPLOAD_PRESET</code> in Vercel or your .env file to enable direct uploads. You can also paste an image URL directly below.
          </div>
        </div>
      )}

      {/* Upload Action Strip & Input Control */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/webp, image/gif, image/avif"
          disabled={disabled || isUploading}
          className="hidden"
        />

        {/* Upload Trigger Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-[#1A1713] hover:bg-[#FFC93C] text-[#F4EFE4] hover:text-[#14120F] border border-[#F4EFE4]/20 hover:border-[#FFC93C] font-bold uppercase transition-colors shrink-0 cursor-pointer disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#FFC93C]" />
              <span>Uploading ({uploadProgress}%)</span>
            </>
          ) : (
            <>
              <UploadCloud className="w-4 h-4 text-[#FFC93C]" />
              <span>{value ? 'Replace Image' : 'Upload Image'}</span>
            </>
          )}
        </button>

        {/* Direct URL Input */}
        <div className="relative flex-1">
          <input
            type="url"
            value={value}
            onChange={(e) => {
              setUploadError(null);
              onChange(e.target.value);
            }}
            placeholder={placeholder}
            disabled={disabled || isUploading}
            className="w-full px-3 py-2 bg-[#14120F] border border-[#F4EFE4]/20 focus:border-[#FFC93C] text-[#F4EFE4] focus:outline-none pr-8 text-xs font-mono"
          />
          {value && !isUploading && (
            <button
              type="button"
              onClick={handleClearUrl}
              title="Clear Image URL"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#F4EFE4]/40 hover:text-[#E4402A] p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar (during upload) */}
      {isUploading && (
        <div className="space-y-1.5 pt-1">
          <div className="w-full bg-[#14120F] border border-[#F4EFE4]/20 h-2 overflow-hidden">
            <div
              className="bg-[#FFC93C] h-full transition-all duration-150"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#F4EFE4]/70">
            <span>Streaming to Cloudinary [{folder}]...</span>
            <button
              type="button"
              onClick={handleCancelUpload}
              className="text-[#E4402A] hover:underline font-bold uppercase cursor-pointer"
            >
              Cancel Upload
            </button>
          </div>
        </div>
      )}

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="p-2.5 bg-[#E4402A]/15 border border-[#E4402A] text-[#F4EFE4] text-[11px] flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-[#E4402A] shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold text-[#E4402A] block">Cloudinary Error:</span>
            <span>{uploadError}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-[#F4EFE4]/60 hover:text-white"
          >
            &times;
          </button>
        </div>
      )}

      {/* Upload Success Notice */}
      {uploadSuccessMessage && (
        <div className="p-2 bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-[11px] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{uploadSuccessMessage}</span>
        </div>
      )}

      {/* Image Preview & Cloudinary Host Indicator */}
      {value && (
        <div className="p-2.5 bg-[#14120F] border border-[#F4EFE4]/15 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={value}
              alt="Media Preview"
              className="w-14 h-14 object-cover border border-[#FFC93C]/40 shrink-0 bg-[#0A0908]"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[#FFC93C] font-bold text-[11px]">Preview Ready</span>
                {value.includes('cloudinary.com') ? (
                  <span className="px-1.5 py-0.5 bg-[#FFC93C]/20 text-[#FFC93C] border border-[#FFC93C]/40 text-[9px] uppercase font-bold">
                    Cloudinary CDN
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 bg-[#F4EFE4]/10 text-[#F4EFE4]/60 border border-[#F4EFE4]/20 text-[9px] uppercase">
                    Direct URL
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[#F4EFE4]/60 truncate max-w-xs sm:max-w-md mt-0.5">
                {value}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 text-[#F4EFE4]/60 hover:text-[#FFC93C]"
              title="Open in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={handleClearUrl}
              className="px-2 py-1 bg-[#E4402A]/20 hover:bg-[#E4402A] text-[#E4402A] hover:text-white border border-[#E4402A]/40 font-mono text-[10px] font-bold uppercase transition-colors flex items-center gap-1 cursor-pointer"
              title="Remove photo"
            >
              <X className="w-3 h-3" />
              <span>REMOVE PHOTO</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
