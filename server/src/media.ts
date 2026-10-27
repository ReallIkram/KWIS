import { v2 as cloudinary } from 'cloudinary';
import { validateMedia } from './media-validation.js';
export function cloud() {
  for (const key of ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'])
    if (!process.env[key])
      throw Object.assign(new Error('Cloud media storage is not configured'), { status: 503 });
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
}
export async function upload(buffer: Buffer, privateFile = false) {
  const type = await validateMedia(buffer, privateFile);
  const c = cloud();
  const resourceType = privateFile ? 'raw' : type.mime.startsWith('video') ? 'video' : 'image';
  const result = await new Promise<import('cloudinary').UploadApiResponse>((resolve, reject) => {
    const stream = c.uploader.upload_stream(
      {
        folder: privateFile ? 'kwis/resumes' : 'kwis/media',
        resource_type: resourceType,
        type: privateFile ? 'authenticated' : 'upload',
        ...(privateFile ? { format: 'pdf' } : {}),
      },
      (error, result) => (error || !result ? reject(error) : resolve(result)),
    );
    stream.end(type.buffer);
  });
  return {
    publicId: result.public_id,
    url: result.secure_url,
    mime: type.mime,
    bytes: result.bytes,
    width: result.width,
    height: result.height,
    resourceType,
    private: privateFile,
  };
}
