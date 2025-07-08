import { createImageUploadInterceptor, createImageUploadInterceptorWithCustomMessage } from './file-upload.util';
import { FileInterceptor } from '@nestjs/platform-express';

// Mock de FileInterceptor
jest.mock('@nestjs/platform-express', () => ({
  FileInterceptor: jest.fn(),
}));

describe('File Upload Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createImageUploadInterceptor', () => {
    it('should create interceptor with default field name', () => {
      const mockFileInterceptor = jest.fn();
      (FileInterceptor as jest.Mock).mockReturnValue(mockFileInterceptor);

      const result = createImageUploadInterceptor();

      expect(FileInterceptor).toHaveBeenCalledWith('photo', expect.any(Object));
      expect(result).toBe(mockFileInterceptor);
    });

    it('should create interceptor with custom field name', () => {
      const mockFileInterceptor = jest.fn();
      (FileInterceptor as jest.Mock).mockReturnValue(mockFileInterceptor);

      const result = createImageUploadInterceptor('avatar');

      expect(FileInterceptor).toHaveBeenCalledWith('avatar', expect.any(Object));
      expect(result).toBe(mockFileInterceptor);
    });

    it('should include correct configuration', () => {
      const mockFileInterceptor = jest.fn();
      (FileInterceptor as jest.Mock).mockReturnValue(mockFileInterceptor);

      createImageUploadInterceptor();

      const config = (FileInterceptor as jest.Mock).mock.calls[0][1];
      
      expect(config).toHaveProperty('storage');
      expect(config).toHaveProperty('limits');
      expect(config).toHaveProperty('fileFilter');
      expect(config.limits).toEqual({
        fileSize: 5 * 1024 * 1024,
        files: 1,
      });
    });
  });

  describe('createImageUploadInterceptorWithCustomMessage', () => {
    it('should create interceptor with custom error message', () => {
      const mockFileInterceptor = jest.fn();
      (FileInterceptor as jest.Mock).mockReturnValue(mockFileInterceptor);

      const customMessage = 'Custom error message';
      const result = createImageUploadInterceptorWithCustomMessage('photo', customMessage);

      expect(FileInterceptor).toHaveBeenCalledWith('photo', expect.any(Object));
      expect(result).toBe(mockFileInterceptor);
    });

    it('should use default error message when not provided', () => {
      const mockFileInterceptor = jest.fn();
      (FileInterceptor as jest.Mock).mockReturnValue(mockFileInterceptor);

      createImageUploadInterceptorWithCustomMessage();

      expect(FileInterceptor).toHaveBeenCalledWith('photo', expect.any(Object));
    });
  });

  describe('Configuration validation', () => {
    it('should have correct storage configuration', () => {
      (FileInterceptor as jest.Mock).mockReturnValue(jest.fn());

      createImageUploadInterceptor();

      const config = (FileInterceptor as jest.Mock).mock.calls[0][1];
      
      expect(config.storage).toBeDefined();
      expect(config.storage).toHaveProperty('destination');
      expect(config.storage).toHaveProperty('filename');
      expect(typeof config.storage.filename).toBe('function');
    });

    it('should have correct file filter', () => {
      (FileInterceptor as jest.Mock).mockReturnValue(jest.fn());

      createImageUploadInterceptor();

      const config = (FileInterceptor as jest.Mock).mock.calls[0][1];
      
      expect(typeof config.fileFilter).toBe('function');
    });
  });
}); 