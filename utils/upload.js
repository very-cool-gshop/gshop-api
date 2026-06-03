import { Storage } from '@google-cloud/storage';
import multer from 'multer';
import path from 'path';

const storage = new Storage();
const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);

const imageMulter = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});


export const parseImage = (req, res) =>
  new Promise((resolve, reject) => {
    imageMulter.single('image')(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

export const parseMedia = (req, res) =>
  new Promise((resolve, reject) => {
    imageMulter.single('media')(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

export const parseMultipleMedia = (req, res, maxCount = 20) =>
  new Promise((resolve, reject) => {
    imageMulter.array('media', maxCount)(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

export const uploadToGCS = (file) =>
  new Promise((resolve, reject) => {
    const filename = `products/${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    const blob = bucket.file(filename);
    const stream = blob.createWriteStream({ contentType: file.mimetype });

    stream.on('error', reject);
    stream.on('finish', () => {
      resolve(`https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${filename}`);
    });
    stream.end(file.buffer);
  });

export const uploadBufferToGCS = (buffer, filename, contentType) =>
  new Promise((resolve, reject) => {
    const blob = bucket.file(filename);
    const stream = blob.createWriteStream({ contentType });

    stream.on('error', reject);
    stream.on('finish', () => {
      resolve(`https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${filename}`);
    });
    stream.end(buffer);
  });

export const deleteFromGCS = async (url) => {
  const prefix = `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/`;
  const filename = url.startsWith(prefix) ? url.slice(prefix.length) : url;
  console.log('[GCS] deleting:', filename);
  await bucket.file(filename).delete();
  console.log('[GCS] deleted:', filename);
};
