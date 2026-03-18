import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { UploadController } from '../controllers/uploadController';
import { authenticate } from '../middleware/auth';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800') },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'));
    }
  },
});

const router = Router();

router.post('/', authenticate, upload.single('file'), (req, res) => {
  UploadController.handleFileUpload(req, res);
});

export default router;
