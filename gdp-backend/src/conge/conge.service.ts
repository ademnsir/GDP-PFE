import { BadRequestException, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, Between } from 'typeorm';
import { Conge, CongeStatus, CongeType } from './conge.entity';
import { CreateCongeDto, UpdateCongeDto } from './dto/conge.dto';
import { User } from '../users/user.entity';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import * as pdf from 'html-pdf-node';

@Injectable()
export class CongeService {
  constructor(
    @InjectRepository(Conge)
    private readonly congeRepository: Repository<Conge>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createCongeDto: CreateCongeDto): Promise<Conge> {
    const user = await this.userRepository.findOne({
      where: { id: createCongeDto.userId },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    try {
      // Supprimer l'ID s'il est présent pour éviter les conflits
      const { id, ...congeData } = createCongeDto;
      
      const conge = this.congeRepository.create({
        ...congeData,
        user,
        status: CongeStatus.PENDING,
      });

      return await this.congeRepository.save(conge);
    } catch (error) {
      if (error.code === '23505') { // Code d'erreur pour violation de contrainte unique
        if (error.constraint === 'PK_cc04e5a7a08d837bd84462f9142') {
          // Réinitialiser la séquence d'IDs si nécessaire
          await this.resetIdSequence();
          throw new ConflictException('Une erreur est survenue avec l\'ID. Veuillez réessayer.');
        } else {
          throw new ConflictException('Une erreur est survenue lors de la création du congé');
        }
      }
      throw error;
    }
  }

  private async resetIdSequence(): Promise<void> {
    try {
      await this.congeRepository.query(`
        SELECT setval(
          pg_get_serial_sequence('conge', 'id'),
          COALESCE((SELECT MAX(id) FROM conge), 0) + 1,
          false
        );
      `);
    } catch (error) {
      console.error('Erreur lors de la réinitialisation de la séquence:', error);
    }
  }

  async findAll(): Promise<Conge[]> {
    return this.congeRepository.find({ relations: ['user'] });
  }

  async findOne(id: number): Promise<Conge> {
    return this.congeRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async update(id: number, updateCongeDto: UpdateCongeDto): Promise<Conge> {
    await this.congeRepository.update(id, updateCongeDto);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.congeRepository.delete(id);
  }

  async cancelConge(id: number, userId: number): Promise<void> {
    const conge = await this.congeRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!conge) {
      throw new NotFoundException("Congé introuvable");
    }

    // Vérifier que l'utilisateur est le propriétaire du congé
    if (conge.userId !== userId) {
      throw new BadRequestException("Vous ne pouvez annuler que vos propres congés");
    }

    // Vérifier que le congé est en attente
    if (conge.status !== CongeStatus.PENDING) {
      throw new BadRequestException("Seuls les congés en attente peuvent être annulés");
    }

    await this.congeRepository.delete(id);
  }

  async generateCongePDF(id: number, res: Response) {
    try {
      const conge = await this.congeRepository.findOne({
        where: { id },
        relations: ['user'],
      });
      
      if (!conge) {
        throw new NotFoundException("❌ Congé introuvable");
      }

      // Charger le template HTML
      const templatePath = path.join(__dirname, '..', '..', 'src', 'conge', 'conge-template.html');
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Le template de congé est introuvable au chemin: ${templatePath}`);
      }

      const templateHtml = fs.readFileSync(templatePath, 'utf8');
      const template = Handlebars.compile(templateHtml);

      // Préparer les données pour le template
      const logoPath = path.join(__dirname, '..', '..', 'uploads', 'photos', 'logo.png');
      let logoBase64 = '';
      if (fs.existsSync(logoPath)) {
        logoBase64 = fs.readFileSync(logoPath).toString('base64');
      }

      const typeConge = {
        isMaladie: conge.type === CongeType.MALADIE,
        isConge: conge.type === CongeType.CONGE,
        isDeces: conge.type === CongeType.DECES,
        isMariage: conge.type === CongeType.MARIAGE,
        isAutres: conge.type === CongeType.AUTRES,
      };

      const html = template({
        logoBase64,
        firstName: conge.firstName,
        lastName: conge.lastName,
        responsable: conge.responsable || '',
        matricule: conge.matricule || '',
        service: conge.service || '',
        startDate: new Date(conge.startDate).toLocaleDateString('fr-FR'),
        endDate: new Date(conge.endDate).toLocaleDateString('fr-FR'),
        dateReprise: new Date(conge.dateReprise).toLocaleDateString('fr-FR'),
        currentDate: new Date().toLocaleDateString('fr-FR'),
        telephone: conge.telephone || '',
        adresse: conge.adresse || '',
        interim1: conge.interim1 || '',
        interim2: conge.interim2 || '',
        ...typeConge
      });

      // Génération du PDF avec html-pdf-node
      const file = { content: html };
      const options = { format: 'A4', printBackground: true, margin: { top: 20, right: 20, bottom: 20, left: 20 } };
      const pdfBuffer = await pdf.generatePdf(file, options);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="demande_conge.pdf"');
      res.send(pdfBuffer);

    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      res.status(500).send('Erreur lors de la génération du PDF');
    }
  }

  async updateCongeStatus(id: number, status: CongeStatus): Promise<Conge> {
    const conge = await this.congeRepository.findOne({ where: { id } });
    if (!conge) {
      throw new NotFoundException("Congé introuvable");
    }
    conge.status = status;
    return this.congeRepository.save(conge);
  }

  async findByMatricule(matricule: string): Promise<Conge[]> {
    const currentDate = new Date();

    const conges = await this.congeRepository.find({
      where: {
        matricule,
        status: CongeStatus.PENDING,
      },
      relations: ['user'],
    });

    return conges;
  }

  async findAllByMatricule(matricule: string): Promise<Conge[]> {
    const conges = await this.congeRepository.find({
      where: {
        matricule,
      },
      relations: ['user'],
      order: {
        startDate: 'DESC',
      },
    });

    return conges;
  }

  async getCongesByMonth(month: string): Promise<Conge[]> {
    const monthNumber = this.getMonthNumber(month);
    if (!monthNumber) {
      throw new BadRequestException('Mois invalide');
    }

    const startDate = new Date(new Date().getFullYear(), monthNumber - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(new Date().getFullYear(), monthNumber, 0).toISOString().split('T')[0];

    return this.congeRepository.find({
      where: {
        startDate: Between(startDate, endDate),
      },
      relations: ['user'],
    });
  }

  async getMonthlyStats() {
    const currentYear = new Date().getFullYear();
    const stats = new Array(12).fill(0);

    for (let month = 0; month < 12; month++) {
      const startDate = new Date(currentYear, month, 1).toISOString().split('T')[0];
      const endDate = new Date(currentYear, month + 1, 0).toISOString().split('T')[0];

      const count = await this.congeRepository.count({
        where: {
          startDate: Between(startDate, endDate),
        },
      });

      stats[month] = count;
    }

    return stats;
  }

  private getMonthNumber(month: string): number | null {
    const months: { [key: string]: number } = {
      'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4,
      'May': 5, 'Jun': 6, 'Jul': 7, 'Aug': 8,
      'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
    };
    return months[month] || null;
  }
}
