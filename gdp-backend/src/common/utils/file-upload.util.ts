import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { HttpException, HttpStatus } from '@nestjs/common';

// Configuration commune pour l'upload d'images
const createImageUploadConfig = (errorMessage: string) => ({
  storage: diskStorage({
    destination: './uploads/photos',
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      callback(null, `${uniqueSuffix}${ext}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 1, // Un seul fichier à la fois
  },
  fileFilter: (req, file, callback) => {
    const imageRegex = /\/(jpg|jpeg|png)$/;
    if (!imageRegex.exec(file.mimetype)) {
      return callback(
        new HttpException(errorMessage, HttpStatus.BAD_REQUEST),
        false,
      );
    }
    callback(null, true);
  },
});

export const createImageUploadInterceptor = (fieldName: string = 'photo') => {
  return FileInterceptor(fieldName, createImageUploadConfig('Seules les images JPG, JPEG et PNG sont autorisées'));
};

export const createImageUploadInterceptorWithCustomMessage = (
  fieldName: string = 'photo',
  errorMessage: string = 'Seules les images JPG, JPEG et PNG sont autorisées'
) => {
  return FileInterceptor(fieldName, createImageUploadConfig(errorMessage));
}; 