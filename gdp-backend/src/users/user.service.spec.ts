import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { UserRole, UserStatus } from './user.entity';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let repository: Repository<User>;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findOneBy: jest.fn(),
    findByIds: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { id: 1, firstName: 'John', lastName: 'Doe' },
        { id: 2, firstName: 'Jane', lastName: 'Smith' },
      ];
      mockRepository.find.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toEqual(mockUsers);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const mockUser = { id: 1, firstName: 'John', lastName: 'Doe' };
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['projects'],
      });
    });

    it('should throw HttpException when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(HttpException);
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        username: 'johndoe',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        matricule: 'WB123456',
        role: UserRole.DEVELOPPER,
        status: UserStatus.ACTIF,
        hireDate: new Date('2023-01-01'),
        endDate: new Date('2025-12-31'),
      };
      const mockUser = { id: 1, ...createUserDto };
      
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(mockRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('update', () => {
    it('should update an existing user', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'John Updated',
        lastName: 'Doe Updated',
      };
      const mockUser = { id: 1, ...updateUserDto };
      
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.update(1, updateUserDto);

      expect(result).toEqual(mockUser);
      expect(mockRepository.update).toHaveBeenCalledWith(1, updateUserDto);
    });

    it('should throw HttpException when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, {})).rejects.toThrow(HttpException);
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.delete(1);

      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw HttpException when user not found', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.delete(999)).rejects.toThrow(HttpException);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const mockUser = { id: 1, email: 'john@example.com' };
      mockRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.findByEmail('john@example.com');

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ email: 'john@example.com' });
    });
  });

  describe('findByMatricule', () => {
    it('should return a user by matricule', async () => {
      const mockUser = { id: 1, matricule: 'EMP001' };
      mockRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.findByMatricule('EMP001');

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ matricule: 'EMP001' });
    });
  });

  describe('updateUserStatus', () => {
    it('should update user status', async () => {
      const mockUser = { id: 1, status: UserStatus.ACTIF };
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      const result = await service.updateUserStatus(1, UserStatus.SUSPENDU);

      expect(result).toEqual(mockUser);
      expect(mockRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('should throw HttpException when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.updateUserStatus(999, UserStatus.ACTIF)).rejects.toThrow(HttpException);
    });
  });

  describe('updatePhoto', () => {
    it('should update user photo', async () => {
      const mockUser = { id: 1, photo: '/old-photo.jpg' };
      mockRepository.findOne.mockResolvedValue(mockUser);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.updatePhoto(1, '/new-photo.jpg');

      expect(result).toEqual(mockUser);
      expect(mockRepository.update).toHaveBeenCalledWith(1, { photo: '/new-photo.jpg' });
    });

    it('should throw HttpException when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.updatePhoto(999, '/photo.jpg')).rejects.toThrow(HttpException);
    });
  });
}); 