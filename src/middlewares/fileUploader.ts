import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import path from 'path';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_EXTENSIONS = ['.mp4'];

const storage = multer.memoryStorage();

const fileFilter = (
   _req: Request,
   file: Express.Multer.File,
   cb: FileFilterCallback
) => {
   const fileExt = path.extname(file.originalname).toLowerCase();

   if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
      return cb(
         new multer.MulterError(
            'LIMIT_UNEXPECTED_FILE',
            'Only .mp4 files are allowed!'
         )
      );
   }

   cb(null, true);
};

const multerUpload = multer({
   storage,
   fileFilter,
   limits: { fileSize: MAX_FILE_SIZE },
});

export default multerUpload;
