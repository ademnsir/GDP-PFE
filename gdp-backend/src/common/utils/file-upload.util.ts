import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { HttpException, HttpStatus } from '@nestjs/common';

export const createImageUploadInterceptor = (fieldName: string = 'photo') => {
  return FileInterceptor(fieldName, {
    storage: diskStorage({
      destination: './uploads/photos',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (req, file, callback) => {
      const imageRegex = /\/(jpg|jpeg|png)$/;
      if (!imageRegex.exec(file.mimetype)) {
        return callback(
          new HttpException('Seules les images JPG, JPEG et PNG sont autorisées', HttpStatus.BAD_REQUEST),
          false,
        );
      }
      callback(null, true);
    },
  });
};

export const createImageUploadInterceptorWithCustomMessage = (
  fieldName: string = 'photo',
  errorMessage: string = 'Seules les images JPG, JPEG et PNG sont autorisées'
) => {
  return FileInterceptor(fieldName, {
    storage: diskStorage({
      destination: './uploads/photos',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `${uniqueSuffix}${ext}`);
      },
    }),
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
}; 