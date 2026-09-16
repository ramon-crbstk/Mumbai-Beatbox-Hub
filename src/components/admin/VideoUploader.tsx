import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Loader2, 
  Video as VideoIcon,
  Play,
  ExternalLink,
  Film
} from 'lucide-react';
import { 
  uploadVideoToCloudinary, 
  CLOUDINARY_CONFIG, 
  CLOUDINARY_FOLDERS 
} from '../../lib/cloudinary';

interface VideoUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  uploadPreset?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  label,
  value,
  onChange,
  folder = CLOUDINARY_FOLDERS.videos,
  uploadPreset = CLOUDINARY_CONFIG.videoPreset,
  placeholder = 'https://res.cloudinary.com/... or upload video file',
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

    setUploadError(null);
    setUploadSuccessMessage(null);
    setIsUploading(true);
    setUploadProgress(0);

    const result = await uploadVideoToCloudinary(file, {
      folder,
      uploadPreset,
      onProgress: (percent) => setUploadProgress(percent),
      onAbortRef: abortRef,
    });

    setIsUploading(false);

    if (result.success && result.secureUrl) {
      onChange(result.secureUrl);
      setUploadSuccessMessage('Video uploaded to Cloudinary successfully!');
      setTimeout(() => setUploadSuccessMessage(null), 4000);
    } else {
      // Preserve existing URL on error; do NOT clear
      setUploadError(result.error || 'Failed to upload video to Cloudinary.');
    }

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

  const isCloudinaryUrl = value.includes('res.cloudinary.com');
  const isDirectVideo =
    value.endsWith('.mp4') ||
    value.endsWith('.webm') ||
    value.endsWith('.mov') ||
    value.includes('/video/upload/') ||
    value.includes('cloudinary');

  return (
    <div className="space-y-2 font-mono text-xs">
      <div className="flex items-center justify-between">
        <label className="block text-[#F4EFE4]/80 uppercase font-semibold">
          {label}
        </label>
        <span className="text-[10px] text-[#F4EFE4]/50">
          Target: Cloudinary &bull; MP4/WebM/MOV (Max 150MB)
        </span>
      </div>

      {/* Cloudinary Configuration Notice */}
      {!isCloudinaryConfigured && (
        <div className="p-2.5 bg-[#FFC93C]/10 border border-[#FFC93C]/40 text-[#FFC93C] text-[11px] flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Cloudinary Setup Notice:</span>
            Add <code className="bg-[#14120F] px-1 py-0.5 text-white">VITE_CLOUDINARY_CLOUD_NAME</code> and{' '}
            <code className="bg-[#14120F] px-1 py-0.5 text-white">VITE_CLOUDINARY_VIDEO_PRESET</code> in Vercel or your .env file to enable video uploads.
          </div>
        </div>
      )}

      {/* Upload Action Strip & Input Control */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Hidden Video Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/ogg,video/avi"
          disabled={disabled || isUploading}
          className="hidden"
        />

        {/* Upload Trigger Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-[#1A1713] hover:bg-[#E4402A] text-[#F4EFE4] hover:text-white border border-[#F4EFE4]/20 hover:border-[#E4402A] font-bold uppercase transition-colors shrink-0 cursor-pointer disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#FFC93C]" />
              <span>Uploading ({uploadProgress}%)</span>
            </>
          ) : (
            <>
              <UploadCloud className="w-4 h-4 text-[#E4402A]" />
              <span>Upload Video</span>
            </>
          )}
        </button>

        {/* Text Input for URL fallback */}
        <div className="relative flex-1">
          <input
            type="url"
            value={value}
            onChange={(e) => {
              const val = e.target.value;
              onChange(val);
              if (val.startsWith('data:') || val.startsWith('blob:')) {
                setUploadError('Local blob/base64 URLs cannot be saved. Please use the Upload Video button to host on Cloudinary.');
              } else {
                setUploadError(null);
              }
            }}
            placeholder={placeholder}
            disabled={disabled || isUploading}
            className="w-full h-full min-h-[38px] px-3 py-1.5 bg-[#14120F] border border-[#F4EFE4]/20 focus:border-[#E4402A] text-[#F4EFE4] placeholder-[#F4EFE4]/30 focus:outline-none text-xs"
          />
          {value && (
            <button
              type="button"
              onClick={handleClearUrl}
              disabled={disabled || isUploading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#F4EFE4]/40 hover:text-[#E4402A] cursor-pointer"
              title="Clear video URL"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar during Upload */}
      {isUploading && (
        <div className="space-y-1 p-2 bg-[#1A1713] border border-[#E4402A]/40">
          <div className="flex items-center justify-between text-[11px] text-[#F4EFE4]/80">
            <span className="flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-[#E4402A] animate-pulse" />
              Streaming video file to Cloudinary...
            </span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#FFC93C]">{uploadProgress}%</span>
              <button
                type="button"
                onClick={handleCancelUpload}
                className="text-[10px] text-[#E4402A] hover:underline cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
          <div className="w-full h-1.5 bg-[#14120F] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FFC93C] to-[#E4402A] transition-all duration-150"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload Error Alert */}
      {uploadError && (
        <div className="p-2.5 bg-[#E4402A]/15 border border-[#E4402A] text-[#F4EFE4] text-xs flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[#E4402A] shrink-0 mt-0.5" />
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

      {/* Upload Success Alert */}
      {uploadSuccessMessage && (
        <div className="p-2 bg-emerald-950/70 border border-emerald-500 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{uploadSuccessMessage}</span>
        </div>
      )}

      {/* Video Preview Frame */}
      {value && !isUploading && (
        <div className="p-2 bg-[#1A1713] border border-[#F4EFE4]/15 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-[#F4EFE4]/70">
            <span className="flex items-center gap-1">
              <VideoIcon className="w-3.5 h-3.5 text-[#E4402A]" />
              {isCloudinaryUrl ? 'Cloudinary Hosted Video' : 'Video Link'}
            </span>
            <div className="flex items-center gap-2">
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FFC93C] hover:underline flex items-center gap-1 text-[10px]"
              >
                <span>Open in tab</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Direct Video Player Preview */}
          {isDirectVideo && (
            <div className="aspect-video bg-black max-h-[160px] overflow-hidden border border-[#F4EFE4]/10">
              <video
                src={value}
                controls
                className="w-full h-full object-contain"
                preload="metadata"
              >
                Your browser does not support video playback.
              </video>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
