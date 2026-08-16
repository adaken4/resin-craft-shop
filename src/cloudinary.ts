/**
 * Uploads an image file to Cloudinary via the serverless /api/uploads endpoint
 * which dynamically and securely reads credentials from environment variables.
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

  const base64Data = await fileToBase64(file);

  const response = await fetch('/api/uploads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileData: base64Data, folder: 'resin/store' }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to upload image. Please check storage configuration.');
  }

  if (data.url) {
    return data.url;
  }

  throw new Error('Upload succeeded but no image URL was returned.');
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
