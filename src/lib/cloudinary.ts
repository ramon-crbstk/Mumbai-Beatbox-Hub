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
