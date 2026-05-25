import { Storage } from '@google-cloud/storage';
import multer from 'multer';
import path from 'path';

const storage = new Storage();
const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);

const multerInstance = multer({
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
    multerInstance.single('image')(req, res, (err) => {
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
