import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Cloudinary storage — images go to 'images' folder, PDFs/docs to 'documents'
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const ext = file.originalname.split('.').pop().toLowerCase();
    const isPdf = ext === 'pdf';
    const isDoc = ext === 'doc' || ext === 'docx';

    return {
      folder: isPdf || isDoc ? 'edunotify/documents' : 'edunotify/images',
      // For PDFs/docs Cloudinary requires resource_type: 'raw'
      resource_type: isPdf || isDoc ? 'raw' : 'image',
      // Keep original filename readable (slug form)
      public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, '_').replace(/\.[^/.]+$/, '')}`,
      // For images, auto-optimize quality
      ...(!(isPdf || isDoc) && {
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      }),
    };
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type. Allowed: JPG, PNG, GIF, WEBP (images) and PDF, DOC, DOCX (documents).'
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15 MB limit
  },
});

export default upload;
