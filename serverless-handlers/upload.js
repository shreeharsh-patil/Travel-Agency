import { cloudinary } from '../lib/cloudinary.js';
import { authenticateRequest } from '../lib/requestAuth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await authenticateRequest(req, res);
  if (!auth) return;

  const { image, folder = 'horizon_travels' } = req.body || {};

  if (!image) {
    return res.status(400).json({ error: 'Image data (base64 or URL) is required.' });
  }

  // Check if Cloudinary is configured
  const hasCloudinary =
    Boolean(process.env.CLOUDINARY_URL) ||
    Boolean(process.env.CLOUD_NAME && process.env.CLOUD_API_KEY && process.env.CLOUD_API_SECRET);

  if (!hasCloudinary) {
    console.warn('[upload] Cloudinary credentials are not configured.');
    return res.status(503).json({ error: 'Image uploads are temporarily unavailable.' });
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
