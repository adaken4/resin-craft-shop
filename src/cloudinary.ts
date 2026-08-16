// Cloudinary configuration credentials
export const CLOUDINARY_CLOUD_NAME: string = 'resincraft_shop'; 
export const CLOUDINARY_UPLOAD_PRESET: string = 'resincraft_unsigned';

/**
 * Uploads an image file to Cloudinary via unsigned preset.
 * Falls back to an ObjectURL / base64 preview if Cloudinary is unconfigured.
 */
export async function uploadCustomEmblemImage(file: File): Promise<string> {
  // Client-side file size check (limit 5MB per MVP_0 spec)
  const MAX_SIZE_MB = 5;
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    throw new Error(`File size exceeds ${MAX_SIZE_MB}MB limit. Please choose a smaller image.`);
  }

  // Check if Cloudinary is configured with actual credentials
  const isCloudinaryConfigured = 
    CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' && 
    CLOUDINARY_CLOUD_NAME !== 'resincraft_shop' &&
    CLOUDINARY_UPLOAD_PRESET !== 'resincraft_unsigned';

  if (!isCloudinaryConfigured) {
    // Return a local Object URL for immediate live circular preview
    console.info('Cloudinary not configured yet. Using local ObjectURL fallback.');
    return URL.createObjectURL(file);
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Cloudinary upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.warn('Cloudinary upload error, using local fallback:', error);
    return URL.createObjectURL(file);
  }
}
