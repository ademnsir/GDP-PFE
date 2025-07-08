import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { TachePeriodiqueService } from './tache-periodique.service';
import { TachePeriodique, Periodicite } from './tache-periodique.entity';
import { CreateTachePeriodiqueDto, UpdateTachePeriodiqueDto } from './dto/tache-periodique.dto';
import { HttpException } from '@nestjs/common';

describe('TachePeriodiqueService', () => {
  let service: TachePeriodiqueService;
  let repository: Repository<TachePeriodique>;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TachePeriodiqueService,
        {
          provide: getRepositoryToken(TachePeriodique),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TachePeriodiqueService>(TachePeriodiqueService);
    repository = module.get<Repository<TachePeriodique>>(getRepositoryToken(TachePeriodique));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all periodic tasks', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1', frequency: 'DAILY' },
        { id: 2, title: 'Task 2', frequency: 'WEEKLY' },
      ];
      mockRepository.find.mockResolvedValue(mockTasks);

      const result = await service.findAll();

      expect(result).toEqual(mockTasks);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a periodic task by id', async () => {
      const mockTask = { id: 1, title: 'Task 1', frequency: 'DAILY' };
      mockRepository.findOne.mockResolvedValue(mockTask);

      const result = await service.findOne(1);

      expect(result).toEqual(mockTask);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['users'],
      });
    });

    it('should throw HttpException when task not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(HttpException);
    });
  });

  describe('createTache', () => {
    it('should create a new periodic task', async () => {
      const createTaskDto: CreateTachePeriodiqueDto = {
        title: 'New Task',
        description: 'Task description',
        sendDate: '2023-01-01T10:00:00Z',
        periodicite: Periodicite.QUOTIDIEN,
        heureExecution: '10:00',
        users: [1, 2],
      };
      const mockTask = { id: 1, ...createTaskDto };
      
      mockRepository.create.mockReturnValue(mockTask);
      mockRepository.save.mockResolvedValue(mockTask);

      const result = await service.createTache(createTaskDto);

      expect(result).toEqual(mockTask);
      expect(mockRepository.create).toHaveBeenCalledWith(expect.objectContaining(createTaskDto));
      expect(mockRepository.save).toHaveBeenCalledWith(mockTask);
    });
  });

  describe('updateTache', () => {
    it('should update an existing periodic task', async () => {
      const updateTaskDto: UpdateTachePeriodiqueDto = {
        title: 'Updated Task',
        description: 'Updated description',
      };
      const mockTask = { id: 1, ...updateTaskDto };
      
      mockRepository.findOne.mockResolvedValue(mockTask);
      mockRepository.save.mockResolvedValue(mockTask);

      const result = await service.updateTache(1, updateTaskDto);

      expect(result).toEqual(mockTask);
      expect(mockRepository.save).toHaveBeenCalledWith(mockTask);
    });

    it('should throw HttpException when task not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.updateTache(999, {})).rejects.toThrow(HttpException);
    });
  });

  describe('deleteTache', () => {
    it('should delete a periodic task', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.deleteTache(1);

      expect(result).toEqual({ message: 'Tâche ID 1 supprimée avec succès.' });
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw HttpException when task not found', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.deleteTache(999)).rejects.toThrow(HttpException);
    });
  });

  describe('findByUser', () => {
    it('should return periodic tasks for a specific user', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1', users: [{ id: 1 }] },
        { id: 2, title: 'Task 2', users: [{ id: 1 }] },
      ];
      mockRepository.find.mockResolvedValue(mockTasks);

      const result = await service.findByUser(1);

      expect(result).toEqual(mockTasks);
      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: ['users'],
        where: { users: { id: 1 } },
      });
    });
  });
}); 