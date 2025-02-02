import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import path from 'path';

const SUPPORTED_FILE_EXTENSIONS = ['.mp4'];
const MAX_UPLOAD_SIZE = 50 * 1024 * 1024; // 50MB

const storage = multer.memoryStorage();

const fileFilter = (
   req: Request,
   file: Express.Multer.File,
   cb: FileFilterCallback
) => {
   const fileExt = path.extname(file.originalname).toLowerCase();

   if (!SUPPORTED_FILE_EXTENSIONS.includes(fileExt)) {
      return cb(new Error('Invalid file format! Only .mp4 files are allowed.'));
   }

   cb(null, true);
};

const multerUpload = multer({
   storage,
   fileFilter,
   limits: { fileSize: MAX_UPLOAD_SIZE },
});

export default multerUpload;
