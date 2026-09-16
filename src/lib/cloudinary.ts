/**
 * Cloudinary Client-Side Upload Utility for Mumbai Beatbox Hub (MBH)
 *
 * Implements secure unsigned image uploads using Cloudinary's Unsigned Upload Presets.
 * ZERO API secrets are exposed to the browser.
 */

export interface CloudinaryUploadResult {
  success: boolean;
  secureUrl?: string;
  publicId?: string;
  error?: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

export interface UploadProgressCallback {
  (percent: number): void;
}

export interface CloudinaryUploadOptions {
  folder?: string;
  uploadPreset?: string;
  preset?: string;
  resourceType?: 'image' | 'video' | 'raw' | 'auto';
  onProgress?: UploadProgressCallback;
  onAbortRef?: { current: (() => void) | null };
}

export const CLOUDINARY_FOLDERS = {
  memberPhotos: 'mumbai-beatbox-hub/members/photos',
  memberVoiceNotes: 'mumbai-beatbox-hub/members/voice-notes',
  gallery: 'mumbai-beatbox-hub/gallery',
  videos: 'mumbai-beatbox-hub/videos',
  videoThumbnails: 'mumbai-beatbox-hub/videos/thumbnails',
  events: 'mumbai-beatbox-hub/events',
} as const;

// Configuration from client environment variables (configured in Vercel or .env)
export const CLOUDINARY_CONFIG = {
  get cloudName(): string {
    return (
      (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined)?.trim() ||
      ''
    );
  },
  get uploadPreset(): string {
    return (
      (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined)?.trim() ||
      'mbh_unsigned'
    );
  },
  // Dedicated unsigned upload preset for member photos
  get memberPhotoPreset(): string {
    return (
      (import.meta.env.VITE_CLOUDINARY_PHOTO_PRESET as string | undefined)?.trim() ||
      (import.meta.env.VITE_CLOUDINARY_IMAGE_PRESET as string | undefined)?.trim() ||
      (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined)?.trim() ||
      'mbh_member_photos'
    );
  },
  // Dedicated unsigned upload preset for member voice-notes (supports audio)
  get memberVoiceNotePreset(): string {
    return (
      (import.meta.env.VITE_CLOUDINARY_AUDIO_PRESET as string | undefined)?.trim() ||
      (import.meta.env.VITE_CLOUDINARY_VOICE_NOTE_PRESET as string | undefined)?.trim() ||
      (import.meta.env.VITE_CLOUDINARY_AUDIO_UPLOAD_PRESET as string | undefined)?.trim() ||
      (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined)?.trim() ||
      'mbh_member_audio'
    );
  },
  // Dedicated unsigned upload preset for visual gallery photos (images)
  get galleryPreset(): string {
    return (
      (import.meta.env.VITE_CLOUDINARY_GALLERY_PRESET as string | undefined)?.trim() ||
      'mbh_gallery_images'
    );
  },
  // Dedicated unsigned upload preset for featured videos (video files)
  get videoPreset(): string {
    return (
      (import.meta.env.VITE_CLOUDINARY_VIDEO_PRESET as string | undefined)?.trim() ||
      'mbh_featured_videos'
    );
  },
  // Dedicated unsigned upload preset for featured video thumbnails (images)
  get videoThumbnailPreset(): string {
    return (
      (import.meta.env.VITE_CLOUDINARY_VIDEO_THUMBNAIL_PRESET as string | undefined)?.trim() ||
      'mbh_video_thumbnails'
    );
  },
  get imageUploadPreset(): string {
    return this.memberPhotoPreset;
  },
  get audioUploadPreset(): string {
    return this.memberVoiceNotePreset;
  },
  get defaultFolder(): string {
    return (
      (import.meta.env.VITE_CLOUDINARY_FOLDER as string | undefined)?.trim() ||
      'mbh_media'
    );
  },
};

/**
 * Validates file type and size before initiating upload
 */
export function validateImageFile(file: File, maxSizeBytes: number = 10 * 1024 * 1024): { valid: boolean; error?: string } {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/avif',
  ];

  if (!allowedMimeTypes.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Invalid file format (${file.type || 'unknown'}). Supported formats: JPG, PNG, WEBP, GIF, AVIF.`,
    };
  }

  if (file.size > maxSizeBytes) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `File is too large (${sizeMb} MB). Maximum allowed size is ${maxMb} MB.`,
    };
  }

  return { valid: true };
}

/**
 * Uploads a local File or Blob directly to Cloudinary using an unsigned upload preset.
 * Reports real-time upload progress (0-100) via XMLHttpRequest.
 */
export function uploadImageToCloudinary(
  file: File,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve) => {
    // 1. Validate File
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return resolve({ success: false, error: validation.error });
    }

    // 2. Validate Cloudinary configuration
    const cloudName = CLOUDINARY_CONFIG.cloudName;
    const uploadPreset = options.uploadPreset || options.preset || CLOUDINARY_CONFIG.imageUploadPreset || CLOUDINARY_CONFIG.uploadPreset;
    const rawFolder = options.folder || CLOUDINARY_CONFIG.defaultFolder;
    const folder = rawFolder ? rawFolder.replace(/\/+$/, '') : '';

    if (!cloudName) {
      return resolve({
        success: false,
        error:
          'Cloudinary is not configured. Please define VITE_CLOUDINARY_CLOUD_NAME in your environment variables or Vercel dashboard.',
      });
    }

    const resourceType = options.resourceType || 'image';
    const uploadUrl = `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/${resourceType}/upload`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    if (folder) {
      formData.append('folder', folder);
    }

    const xhr = new XMLHttpRequest();

    // Attach cancellation handler
    if (options.onAbortRef) {
      options.onAbortRef.current = () => {
        xhr.abort();
      };
    }

    // Monitor upload progress
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && options.onProgress) {
        const percent = Math.min(99, Math.round((event.loaded / event.total) * 100));
        options.onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (options.onAbortRef) {
        options.onAbortRef.current = null;
      }

      let jsonResponse: Record<string, unknown> = {};
      try {
        jsonResponse = JSON.parse(xhr.responseText);
      } catch {
        // Not JSON
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        if (options.onProgress) {
          options.onProgress(100);
        }

        const secureUrl = (jsonResponse.secure_url as string) || (jsonResponse.url as string);
        const publicId = jsonResponse.public_id as string | undefined;

        if (secureUrl) {
          return resolve({
            success: true,
            secureUrl,
            publicId,
            width: jsonResponse.width as number | undefined,
            height: jsonResponse.height as number | undefined,
            format: jsonResponse.format as string | undefined,
            bytes: jsonResponse.bytes as number | undefined,
          });
        }

        return resolve({
          success: false,
          error: 'Cloudinary succeeded but did not return a valid secure_url.',
        });
      }

      // Handle Cloudinary error response
      const errMsg =
        typeof jsonResponse.error === 'object' && jsonResponse.error && 'message' in jsonResponse.error
          ? String((jsonResponse.error as { message: unknown }).message)
          : `Upload failed (HTTP ${xhr.status}): ${xhr.statusText || 'Unknown Cloudinary error'}`;

      console.warn('Cloudinary upload failure:', errMsg, jsonResponse);

      // Provide clear diagnostic hint for common preset mistakes
      let helpfulTip = '';
      if (errMsg.toLowerCase().includes('upload preset') || errMsg.toLowerCase().includes('unsigned')) {
        helpfulTip = ` (Tip: Ensure upload preset "${uploadPreset}" exists in your Cloudinary console with Signing Mode set to "Unsigned")`;
      }

      return resolve({
        success: false,
        error: `${errMsg}${helpfulTip}`,
      });
    };

    xhr.onerror = () => {
      if (options.onAbortRef) {
        options.onAbortRef.current = null;
      }
      return resolve({
        success: false,
        error: 'Network error connecting to Cloudinary. Please check your internet connection.',
      });
    };

    xhr.onabort = () => {
      if (options.onAbortRef) {
        options.onAbortRef.current = null;
      }
      return resolve({
        success: false,
        error: 'Upload cancelled by user.',
      });
    };

    xhr.open('POST', uploadUrl, true);
    xhr.send(formData);
  });
}

/**
 * Validates audio file type and size before initiating upload.
 */
export function validateAudioFile(
  file: File | Blob,
  maxSizeBytes: number = 50 * 1024 * 1024
): { valid: boolean; error?: string } {
  const allowedExtensions = ['.mp3', '.wav', '.m4a', '.ogg', '.webm', '.aac', '.flac', '.mp4'];
  const fileName = (file as File).name ? (file as File).name.toLowerCase() : '';
  const fileType = file.type ? file.type.toLowerCase() : '';

  const hasValidExt = allowedExtensions.some((ext) => fileName.endsWith(ext));
  const isAudioMime =
    fileType.startsWith('audio/') ||
    fileType === 'video/webm' ||
    fileType === 'video/mp4' ||
    fileType === 'application/ogg';

  if (!isAudioMime && !hasValidExt && fileName !== '') {
    return {
      valid: false,
      error: `Invalid audio format (${fileType || fileName}). Supported formats: MP3, WAV, M4A, OGG, WebM, AAC, FLAC.`,
    };
  }

  if (file.size > maxSizeBytes) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `Audio file is too large (${sizeMb} MB). Maximum allowed size is ${maxMb} MB.`,
    };
  }

  return { valid: true };
}

/**
 * Uploads a local audio File or Blob directly to Cloudinary using unsigned upload preset.
 * Destination folder: mumbai-beatbox-hub/members/audio/
 * Uses Cloudinary's 'auto/upload' endpoint to support audio formats seamlessly.
 */
export function uploadAudioToCloudinary(
  file: File | Blob,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve) => {
    // 1. Validate Audio
    const validation = validateAudioFile(file);
    if (!validation.valid) {
      return resolve({ success: false, error: validation.error });
    }

    // 2. Validate Cloudinary configuration
    const cloudName = CLOUDINARY_CONFIG.cloudName;
    const uploadPreset = options.uploadPreset || options.preset || CLOUDINARY_CONFIG.audioUploadPreset || CLOUDINARY_CONFIG.uploadPreset;
    const rawFolder = options.folder || CLOUDINARY_FOLDERS.memberVoiceNotes;
    const folder = rawFolder ? rawFolder.replace(/\/+$/, '') : '';

    if (!cloudName) {
      return resolve({
        success: false,
        error:
          'Cloudinary is not configured. Please define VITE_CLOUDINARY_CLOUD_NAME in your environment variables.',
      });
    }

    // 'auto/upload' detects audio files (mp3, wav, m4a, webm) automatically
    const resourceType = options.resourceType || 'auto';
    const uploadUrl = `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/${resourceType}/upload`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    if (folder) {
      formData.append('folder', folder);
    }

    const xhr = new XMLHttpRequest();

    if (options.onAbortRef) {
      options.onAbortRef.current = () => {
        xhr.abort();
      };
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && options.onProgress) {
        const percent = Math.min(99, Math.round((event.loaded / event.total) * 100));
        options.onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (options.onAbortRef) {
        options.onAbortRef.current = null;
      }

      let jsonResponse: Record<string, unknown> = {};
      try {
        jsonResponse = JSON.parse(xhr.responseText);
      } catch {
        // Not JSON
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        if (options.onProgress) {
          options.onProgress(100);
        }

        const secureUrl = (jsonResponse.secure_url as string) || (jsonResponse.url as string);
        const publicId = jsonResponse.public_id as string | undefined;

        if (secureUrl) {
          return resolve({
            success: true,
            secureUrl,
            publicId,
            format: jsonResponse.format as string | undefined,
            bytes: jsonResponse.bytes as number | undefined,
          });
        }

        return resolve({
          success: false,
          error: 'Cloudinary succeeded but did not return a valid secure_url.',
        });
      }

      // Handle Cloudinary error response
      const errMsg =
        typeof jsonResponse.error === 'object' && jsonResponse.error && 'message' in jsonResponse.error
          ? String((jsonResponse.error as { message: unknown }).message)
          : `Upload failed (HTTP ${xhr.status}): ${xhr.statusText || 'Unknown Cloudinary error'}`;

      console.warn('Cloudinary audio upload failure:', errMsg, jsonResponse);

      let helpfulTip = '';
      if (errMsg.toLowerCase().includes('upload preset') || errMsg.toLowerCase().includes('unsigned')) {
        helpfulTip = ` (Tip: Ensure upload preset "${uploadPreset}" exists in your Cloudinary console with Signing Mode set to "Unsigned")`;
      }

      return resolve({
        success: false,
        error: `${errMsg}${helpfulTip}`,
      });
    };

    xhr.onerror = () => {
      if (options.onAbortRef) {
        options.onAbortRef.current = null;
      }
      return resolve({
        success: false,
        error: 'Network error connecting to Cloudinary. Please check your internet connection.',
      });
    };

    xhr.onabort = () => {
      if (options.onAbortRef) {
        options.onAbortRef.current = null;
      }
      return resolve({
        success: false,
        error: 'Audio upload was cancelled.',
      });
    };

    xhr.open('POST', uploadUrl, true);
    xhr.send(formData);
  });
}

/**
 * Validates video file type and size before initiating upload.
 */
export function validateVideoFile(
  file: File | Blob,
  maxSizeBytes: number = 150 * 1024 * 1024
): { valid: boolean; error?: string } {
  const allowedExtensions = ['.mp4', '.webm', '.mov', '.m4v', '.mkv', '.avi', '.ogv', '.ogg'];
  const fileName = (file as File).name ? (file as File).name.toLowerCase() : '';
  const fileType = file.type ? file.type.toLowerCase() : '';

  const hasValidExt = allowedExtensions.some((ext) => fileName.endsWith(ext));
  const isVideoMime =
    fileType.startsWith('video/') ||
    fileType === 'application/ogg';

  if (!isVideoMime && !hasValidExt && fileName !== '') {
    return {
      valid: false,
      error: `Invalid video format (${fileType || fileName}). Supported formats: MP4, WebM, MOV, M4V, MKV, AVI, OGV.`,
    };
  }

  if (file.size > maxSizeBytes) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `Video file is too large (${sizeMb} MB). Maximum allowed size is ${maxMb} MB.`,
    };
  }

  return { valid: true };
}

/**
 * Uploads a local video File directly to Cloudinary using unsigned upload preset.
 * Destination folder: mumbai-beatbox-hub/videos
 * Uses Cloudinary's '/video/upload' endpoint.
 */
export function uploadVideoToCloudinary(
  file: File | Blob,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve) => {
    // 1. Validate Video
    const validation = validateVideoFile(file);
    if (!validation.valid) {
      return resolve({ success: false, error: validation.error });
    }

    // 2. Validate Cloudinary configuration
    const cloudName = CLOUDINARY_CONFIG.cloudName;
    const uploadPreset =
      options.uploadPreset ||
      options.preset ||
      CLOUDINARY_CONFIG.videoPreset ||
      CLOUDINARY_CONFIG.uploadPreset;
    const rawFolder = options.folder || CLOUDINARY_FOLDERS.videos;
    const folder = rawFolder ? rawFolder.replace(/\/+$/, '') : '';

    if (!cloudName) {
      return resolve({
        success: false,
        error:
          'Cloudinary is not configured. Please define VITE_CLOUDINARY_CLOUD_NAME in your environment variables.',
      });
    }

    // Cloudinary video upload endpoint
    const uploadUrl = `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/video/upload`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    if (folder) {
      formData.append('folder', folder);
    }

    const xhr = new XMLHttpRequest();

    if (options.onAbortRef) {
      options.onAbortRef.current = () => {
        xhr.abort();
      };
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && options.onProgress) {
        const percent = Math.min(99, Math.round((event.loaded / event.total) * 100));
        options.onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (options.onAbortRef) {
        options.onAbortRef.current = null;
      }

      let jsonResponse: Record<string, unknown> = {};
      try {
        jsonResponse = JSON.parse(xhr.responseText);
      } catch {
        // Not JSON
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        if (options.onProgress) {
          options.onProgress(100);
        }

        const secureUrl = (jsonResponse.secure_url as string) || (jsonResponse.url as string);
        const publicId = jsonResponse.public_id as string | undefined;

        if (secureUrl) {
          return resolve({
            success: true,
            secureUrl,
            publicId,
            format: jsonResponse.format as string | undefined,
            bytes: jsonResponse.bytes as number | undefined,
          });
        }

        return resolve({
          success: false,
          error: 'Cloudinary succeeded but did not return a valid video secure_url.',
        });
      }

      // Handle Cloudinary error response
      const errMsg =
        typeof jsonResponse.error === 'object' && jsonResponse.error && 'message' in jsonResponse.error
          ? String((jsonResponse.error as { message: unknown }).message)
          : `Upload failed (HTTP ${xhr.status}): ${xhr.statusText || 'Unknown Cloudinary error'}`;

      console.warn('Cloudinary video upload failure:', errMsg, jsonResponse);

      let helpfulTip = '';
      if (errMsg.toLowerCase().includes('upload preset') || errMsg.toLowerCase().includes('unsigned')) {
        helpfulTip = ` (Tip: Ensure upload preset "${uploadPreset}" exists in your Cloudinary console with Signing Mode set to "Unsigned")`;
      }

      return resolve({
        success: false,
        error: `${errMsg}${helpfulTip}`,
      });
    };

    xhr.onerror = () => {
      if (options.onAbortRef) {
        options.onAbortRef.current = null;
      }
      return resolve({
        success: false,
        error: 'Network error connecting to Cloudinary. Please check your internet connection.',
      });
    };

    xhr.onabort = () => {
      if (options.onAbortRef) {
        options.onAbortRef.current = null;
      }
      return resolve({
        success: false,
        error: 'Video upload was cancelled.',
      });
    };

    xhr.open('POST', uploadUrl, true);
    xhr.send(formData);
  });
}

export interface CloudinaryTransformOptions {
  /** Target width in pixels (defaults to 640 for video thumbnails) */
  width?: number;
  /** Target height in pixels */
  height?: number;
  /** Crop mode (defaults to 'fill' to ensure proper thumbnail proportions) */
  crop?: 'fill' | 'fit' | 'limit' | 'scale' | 'thumb' | 'pad' | string;
  /** Gravity for cropping (defaults to 'auto' for smart focal centering) */
  gravity?: 'auto' | 'center' | 'face' | string;
  /** Format (defaults to 'auto' for modern WebP/AVIF delivery) */
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png' | string;
  /** Quality (defaults to 'auto' for perceptually lossless compression) */
  quality?: 'auto' | 'auto:good' | 'auto:best' | 'auto:eco' | 'auto:low' | number | string;
  /** Aspect ratio string e.g. "16:9" */
  aspectRatio?: string;
  /** Device pixel ratio multiplier e.g. 1, 2 */
  dpr?: number | string;
}

/**
 * Automatically applies Cloudinary resizing and optimization transformations
 * (e.g. width 640, format auto, quality auto, crop fill, gravity auto)
 * to video thumbnails to improve page performance while maintaining visual quality.
 *
 * Supports:
 * - Direct Cloudinary image URLs (/image/upload/...)
 * - Direct Cloudinary video URLs (/video/upload/...) by extracting a frame as JPG
 * - Graceful pass-through for non-Cloudinary images (Unsplash, external CDNs)
 * - Safe handling of pre-existing transformations
 */
export function getCloudinaryVideoThumbnailUrl(
  url?: string | null,
  options?: CloudinaryTransformOptions
): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Local data URLs, blobs, or SVG placeholders shouldn't be transformed
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // Non-Cloudinary URLs (e.g. Unsplash, YouTube, local asset paths) are returned untouched
  if (!trimmed.includes('res.cloudinary.com')) {
    return trimmed;
  }

  const width = options?.width ?? 640;
  const quality = options?.quality ?? 'auto';
  const format = options?.format ?? 'auto';
  const crop = options?.crop ?? 'fill';
  const gravity = options?.gravity ?? 'auto';

  // Construct Cloudinary transformation segment
  // e.g. "w_640,c_fill,g_auto,f_auto,q_auto"
  const transformParts: string[] = [
    `w_${width}`,
    options?.height ? `h_${options.height}` : '',
    options?.aspectRatio ? `ar_${options.aspectRatio}` : '',
    `c_${crop}`,
    gravity ? `g_${gravity}` : '',
    `f_${format}`,
    `q_${quality}`,
    options?.dpr ? `dpr_${options.dpr}` : '',
  ].filter(Boolean);

  const transformString = transformParts.join(',');

  try {
    const uploadIndex = trimmed.indexOf('/upload/');
    if (uploadIndex === -1) {
      return trimmed;
    }

    const prefix = trimmed.substring(0, uploadIndex + '/upload/'.length);
    let afterUpload = trimmed.substring(uploadIndex + '/upload/'.length);

    // If source is a video file, extract poster frame at start and format as image
    const isVideoResource = prefix.includes('/video/upload/');
    let frameExtraction = '';
    if (isVideoResource) {
      frameExtraction = 'so_auto,';
      afterUpload = afterUpload.replace(/\.(mp4|webm|mov|ogg|mkv)$/i, '.jpg');
    }

    const segments = afterUpload.split('/');
    const firstSegment = segments[0] || '';

    // Check if the segment right after /upload/ contains transformation flags
    // (excluding version tags like v1726000000)
    const isTransformSegment =
      !firstSegment.match(/^v\d+$/) &&
      (firstSegment.includes('w_') ||
       firstSegment.includes('h_') ||
       firstSegment.includes('c_') ||
       firstSegment.includes('q_') ||
       firstSegment.includes('f_') ||
       firstSegment.includes('g_'));

    if (isTransformSegment) {
      // Replace existing transformation segment
      segments[0] = `${frameExtraction}${transformString}`;
      return prefix + segments.join('/');
    } else {
      // Insert transformation right after /upload/
      return `${prefix}${frameExtraction}${transformString}/${afterUpload}`;
    }
  } catch {
    return trimmed;
  }
}

