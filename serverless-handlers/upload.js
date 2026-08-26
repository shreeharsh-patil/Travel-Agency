import { cloudinary } from '../lib/cloudinary.js';
import { getTokenFromReq, verifyToken } from '../lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { image, folder = 'horizon_travels' } = req.body || {};

  if (!image) {
    return res.status(400).json({ error: 'Image data (base64 or URL) is required.' });
  }

  // Check if Cloudinary is configured
  const hasCloudinary =
    Boolean(process.env.CLOUDINARY_URL) ||
    Boolean(process.env.CLOUD_NAME && process.env.CLOUD_API_KEY && process.env.CLOUD_API_SECRET);

  if (!hasCloudinary) {
    // If Cloudinary credentials are not configured, allow returning the base64 or placeholder gracefully
    console.warn('[upload] Cloudinary credentials not found. Using direct payload.');
    return res.status(200).json({
      url: image.startsWith('data:') ? image : image,
      public_id: `local_${Date.now()}`,
      provider: 'local_fallback',
      message: 'Upload succeeded with local fallback. Configure CLOUD_NAME or CLOUDINARY_URL in .env for Cloudinary CDN storage.'
    });
  }

  try {
    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder,
      resource_type: 'image',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    return res.status(200).json({
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id,
      format: uploadResponse.format,
      width: uploadResponse.width,
      height: uploadResponse.height,
      provider: 'cloudinary'
    });
  } catch (err) {
    console.error('[upload] Cloudinary upload error:', err);
    return res.status(500).json({ error: err.message || 'Failed to upload image to Cloudinary.' });
  }
}
