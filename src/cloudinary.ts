// Cloudinary configuration
export const CLOUDINARY_CLOUD_NAME: string = 'dhktegodg';
export const CLOUDINARY_UPLOAD_PRESET: string = 'resin_craft';

/**
 * Uploads an image file to Cloudinary.
 * First tries client-side direct upload via unsigned preset (fastest, zero server latency);
 * falls back to the serverless proxy /api/uploads,
 * and if offline, returns an ObjectURL or Base64 preview for immediate feedback.
 */
export async function uploadCustomEmblemImage(file: File): Promise<string> {
  const MAX_SIZE_MB = 5;
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the ${MAX_SIZE_MB}MB limit.`);
  }

  // Validate MIME type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
  if (!allowedTypes.includes(file.type) && !file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file (JPG, PNG, or WEBP).');
  }

  // 1. Direct Unsigned Cloudinary Upload
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'resin/store');

    const directRes = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (directRes.ok) {
      const data = await directRes.json();
      if (data.secure_url || data.url) {
        return data.secure_url || data.url;
      }
    }
  } catch (err) {
    console.warn('Direct Cloudinary upload error, trying backend proxy:', err);
  }

  // 2. Fallback to /api/uploads Serverless Proxy
  try {
    const base64Data = await fileToBase64(file);
    const response = await fetch('/api/uploads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileData: base64Data, folder: 'resin/store' }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.url) {
        return data.url;
      }
    }
  } catch (err) {
    console.warn('API upload route unreachable, falling back to direct browser preview:', err);
  }

  // 3. Fallback to local Object URL for offline preview
  return URL.createObjectURL(file);
}

/**
 * Helper to convert a File to a Base64 data URL
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}
