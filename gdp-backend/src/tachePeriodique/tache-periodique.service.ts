import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TachePeriodique } from './tache-periodique.entity';
import { CreateTachePeriodiqueDto, UpdateTachePeriodiqueDto } from './dto/tache-periodique.dto';
import { User } from '../users/user.entity';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TachePeriodiqueService {
  constructor(
    @InjectRepository(TachePeriodique)
    private readonly tachePeriodiqueRepository: Repository<TachePeriodique>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Créer une tâche périodique et programmer l'envoi des emails.
   */
  async createTache(dto: CreateTachePeriodiqueDto): Promise<TachePeriodique> {
    // Récupérer les utilisateurs sélectionnés
    const users = await this.userRepository.findByIds(dto.users);
    if (!users || users.length === 0) {
      throw new Error('Aucun utilisateur valide trouvé pour cette tâche.');
    }

    // Créer la tâche périodique
    const tache = this.tachePeriodiqueRepository.create({
      ...dto,
      users,
      sendDate: new Date(dto.sendDate),
    });
    const savedTache = await this.tachePeriodiqueRepository.save(tache);

    // Programmer l'envoi des emails
    this.scheduleEmail(savedTache);

    return savedTache;
  }

  /**
   * Envoyer un email avec un template HTML.
   */
  private async sendEmail(
    email: string,
    firstName: string,
    lastName: string,
    subject: string,
    taskTitle: string,
    actionUrl: string,
  ) {
    // Lire le template HTML
    const templatePath = path.join(
      process.cwd(),
      'src',
      'tachePeriodique',
      'email-template.html'
    );
    let templateContent: string;
    try {
      templateContent = fs.readFileSync(templatePath, 'utf-8');
      console.log('Template HTML chargé depuis:', templatePath);
    } catch (error) {
      console.error('Erreur lors du chargement du fichier HTML:', error.message);
      console.error('Chemin tenté:', templatePath);
      throw new Error('Impossible de charger le template de l\'email.');
    }

    // Injecter les données dynamiques
    const emailContent = templateContent
      .replace('{{firstName}}', firstName)
      .replace('{{lastName}}', lastName)
      .replace('{{taskTitle}}', taskTitle)
      .replace('{{actionUrl}}', actionUrl);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    try {
      console.log(`Envoi d'un email à : ${email}`);
      await transporter.sendMail({
        from: `"Notification" <${process.env.EMAIL_USER}>`,
        to: email,
        subject,
        html: emailContent,
      });
      console.log(`Email envoyé avec succès à ${email}`);
    } catch (error) {
      console.error(`Erreur lors de l'envoi de l'email à ${email}:`, error.message);
    }
  }

  /**
   * Récupérer toutes les tâches périodiques.
   */
  async findAll(): Promise<TachePeriodique[]> {
    return this.tachePeriodiqueRepository.find({
      relations: ['users'], // Inclure les relations avec les utilisateurs
    });
  }

  private adjustDateToNextMonday(date: Date): Date {
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0) { // Dimanche
      date.setDate(date.getDate() + 1);
    } else if (dayOfWeek === 6) { // Samedi
      date.setDate(date.getDate() + 2);
    }
    return date;
  }

  /**
   * Programmer l'envoi des emails pour une tâche périodique.
   */
  private async scheduleEmail(task: TachePeriodique) {
    const now = new Date();
    // Créer une nouvelle date avec la date de sendDate mais l'heure de heureExecution
    const [hours, minutes] = task.heureExecution.split(':').map(Number);
    let sendDate = new Date(task.sendDate);
    sendDate.setHours(hours, minutes, 0, 0);

    console.log('=== DEBUG EMAIL SCHEDULE ===');
    console.log('Tâche:', {
      id: task.id,
      title: task.title,
      sendDate: task.sendDate,
      heureExecution: task.heureExecution,
      periodicite: task.periodicite,
      dateEnvoiCalculee: sendDate.toISOString()
    });

    // Ajuster la date au lundi suivant si c'est un weekend pour les tâches mensuelles et annuelles
    if ((task.periodicite === 'MENSUEL' || task.periodicite === 'ANNUEL') && (sendDate.getDay() === 0 || sendDate.getDay() === 6)) {
      sendDate = this.adjustDateToNextMonday(sendDate);
      console.log('Date ajustée au lundi suivant:', sendDate.toISOString());
    }

    // Calculer le délai en millisecondes
    const delay = sendDate.getTime() - now.getTime();

    console.log('Détails du calcul:');
    console.log('Date actuelle:', now.toISOString());
    console.log('Date d\'envoi (avec heureExecution):', sendDate.toISOString());
    console.log('Délai calculé (ms):', delay);

    if (delay > 0) {
      console.log(`Email programmé pour être envoyé dans ${delay}ms (${Math.floor(delay/1000/60)} minutes)`);

      // Programmer l'envoi de l'email
      setTimeout(async () => {
        console.log(`Tentative d'envoi d'email pour la tâche ${task.id}`);
        for (const user of task.users) {
          try {
            await this.sendEmail(
              user.email,
              user.firstName,
              user.lastName,
              'Nouvelle Tâche Périodique',
              task.title,
              'http://localhost:3001/' + task.id,
            );
            console.log(`Email envoyé avec succès à ${user.email}`);
          } catch (error) {
            console.error(
              `Erreur lors de l'envoi de l'email à ${user.email}:`,
              error.message,
            );
          }
        }
      }, delay);
    } else {
      console.log('Date d\'envoi déjà passée. Email non programmé.');
      console.log(
        `Tâche prévue pour: ${sendDate.toISOString()} mais la date actuelle est ${now.toISOString()}`
      );
    }
  }

  async deleteTache(id: number): Promise<{ message: string }> {
    const result = await this.tachePeriodiqueRepository.delete(id);
  
    if (result.affected === 0) {
      throw new NotFoundException(`Tâche avec l'ID ${id} introuvable.`);
    }
  
    return { message: `Tâche ID ${id} supprimée avec succès.` };
  }

  async findOne(id: number): Promise<TachePeriodique> {
    const tache = await this.tachePeriodiqueRepository.findOne({
      where: { id },
      relations: ['users'],
    });
    if (!tache) {
      throw new NotFoundException(`Tâche périodique avec l'ID ${id} introuvable.`);
    }
    return tache;
  }

  async updateTache(id: number, dto: UpdateTachePeriodiqueDto): Promise<TachePeriodique> {
    console.log('=== DEBUG UPDATE TACHE ===');
    console.log('ID de la tâche:', id);
    console.log('Données reçues:', dto);

    const tache = await this.findOne(id);
    console.log('Tâche trouvée:', tache);
    
    if (dto.users) {
      const users = await this.userRepository.findByIds(dto.users);
      if (!users || users.length === 0) {
        throw new Error('Aucun utilisateur valide trouvé pour cette tâche.');
      }
      tache.users = users;
    }

    // Mettre à jour tous les champs fournis
    if (dto.title) {
      console.log('Mise à jour du titre:', dto.title);
      tache.title = dto.title;
    }
    if (dto.description) {
      console.log('Mise à jour de la description:', dto.description);
      tache.description = dto.description;
    }
    if (dto.sendDate) {
      console.log('Mise à jour de la date d\'envoi:', dto.sendDate);
      tache.sendDate = new Date(dto.sendDate);
    }
    if (dto.heureExecution) {
      console.log('Mise à jour de l\'heure d\'exécution:', dto.heureExecution);
      tache.heureExecution = dto.heureExecution;
    }
    if (dto.periodicite) {
      console.log('Mise à jour de la périodicité:', dto.periodicite);
      tache.periodicite = dto.periodicite;
    }
    if (typeof dto.estActive === 'boolean') {
      console.log('Mise à jour de l\'état actif:', dto.estActive);
      tache.estActive = dto.estActive;
    }

    console.log('Tâche avant sauvegarde:', tache);

    // Sauvegarder les modifications
    const updatedTache = await this.tachePeriodiqueRepository.save(tache);
    console.log('Tâche après sauvegarde:', updatedTache);

    // Reprogrammer l'envoi des emails si nécessaire
    if (dto.sendDate || dto.heureExecution) {
      console.log('Reprogrammation des emails...');
      this.scheduleEmail(updatedTache);
    }

    return updatedTache;
  }

  async findByUser(userId: number): Promise<TachePeriodique[]> {
    return this.tachePeriodiqueRepository.find({
      where: {
        users: { id: userId },
      },
      relations: ['users'],
    });
  }
}
