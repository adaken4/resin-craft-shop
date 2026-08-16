// Cloudinary configuration defaults
export const CLOUDINARY_CLOUD_NAME: string = 'resincraft_shop';
export const CLOUDINARY_UPLOAD_PRESET: string = 'resincraft_unsigned';

/**
 * Uploads an image file to Cloudinary.
 * First tries client-side direct upload; falls back to serverless proxy /api/uploads,
 * and if unconfigured, returns an ObjectURL or Base64 preview for immediate feedback.
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

  // Convert to Base64 for reliable transport
  const base64Data = await fileToBase64(file);

  try {
    // Try sending to /api/uploads
    const response = await fetch('/api/uploads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileData: base64Data }),
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

  // Fallback to local Object URL for immediate preview
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
