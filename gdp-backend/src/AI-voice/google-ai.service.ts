import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatSessionService } from './chat-session/chat-session.service';
import { ProjectContextService } from './project-context.service';

@Injectable()
export class GoogleAiService {
  private genAI: GoogleGenerativeAI;
  private model;

  constructor(
    private readonly chatSessionService: ChatSessionService,
    private readonly projectContextService: ProjectContextService
  ) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });
  }

  async sendMessage(message: string, userRole?: string): Promise<string> {
    const generationConfig = {
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 2048,
      responseMimeType: 'text/plain',
    };

    try {
      // Détecter le contexte du message
      const context = this.projectContextService.detectContext(message);
      console.log('🔍 Contexte détecté:', context);
      
      // Générer le prompt contextuel spécialisé
      const contextualPrompt = this.projectContextService.generateContextualPrompt(message, userRole);
      console.log('📝 Prompt contextuel généré pour le contexte:', context);
      
      // Récupérer l'historique de conversation
      let history = await this.chatSessionService.getSessionMessages();
      
      // Construire le message complet avec contexte
      const fullPrompt = `${contextualPrompt}

HISTORIQUE DE CONVERSATION:
${history}

MESSAGE ACTUEL DE L'UTILISATEUR: ${message}

INSTRUCTIONS SPÉCIFIQUES:
- Réponds de manière naturelle et conversationnelle
- Utilise le contexte spécialisé détecté: ${context}
- Sois précis et propose des actions concrètes
- Utilise des emojis pour rendre la réponse engageante
- Si c'est une question sur le projet, réponds avec des détails spécifiques

RÉPONSE:`;
      
      console.log('🚀 Envoi au modèle avec contexte spécialisé');
      
      // Envoyer au modèle avec le contexte spécialisé
      const chatSession = this.model.startChat({
        generationConfig,
        history: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      });

      // Obtenir la réponse de l'IA
      const result = await chatSession.sendMessage(message);
      const responseText = await result.response.text();
      
      console.log('✅ Réponse reçue du modèle');
      
      // Ajouter la conversation à l'historique
      const conversationEntry = `\nUser: ${message}\nWifakBankAI: ${responseText}`;
      await this.chatSessionService.updateSession(conversationEntry);

      return responseText;
    } catch (error) {
      console.error('❌ Erreur lors de l\'appel de AI:', error);
      
      // En cas d'erreur, retourner une réponse de fallback contextuelle
      const context = this.projectContextService.detectContext(message);
      const quickResponses = this.projectContextService.getQuickResponses(context);
      
      // Retourner une réponse plus naturelle même en cas d'erreur
      if (context === 'projectHelp') {
        return `Oui, je connais très bien votre projet GDP ! 🚀 C'est une application de gestion de projets pour WifakBank qui permet de gérer les projets, tâches, utilisateurs, environnements et plus encore. Que souhaitez-vous savoir spécifiquement sur votre projet ?`;
      }
      
      if (context === 'taskHelp') {
        if (userRole === 'DEVELOPPER') {
          return `Je peux vous aider avec vos tâches ! ✅ 

En tant que développeur, voici comment procéder :
1. Cliquez sur "Mes tableaux de travail"
2. Sélectionnez le tableau du projet souhaité
3. Cliquez sur le bouton "Créer tâche"
4. Remplissez les détails de la tâche
5. Assignez la priorité et l'échéance
6. Sauvegardez la tâche

Que souhaitez-vous faire exactement ?`;
        }
        return `Je peux vous aider avec vos tâches ! ✅ Voici comment procéder : ${quickResponses.join(' ')}`;
      }
      
      if (context === 'environmentHelp' && userRole === 'INFRA') {
        return `En tant qu'INFRA, voici comment gérer les environnements ! 🖥️

Workflow recommandé :
1. Accéder à la section "Environnements"
2. Cliquer sur "Nouvel environnement"
3. Remplir les informations techniques (serveur, OS, etc.)
4. Configurer les accès et permissions
5. Installer les logiciels nécessaires
6. Tester la connectivité et les services
7. Documenter la configuration

Que souhaitez-vous configurer ?`;
      }
      
      return `Je suis là pour vous aider ! 💡 ${quickResponses.join(' ')}`;
    }
  }

  // Méthode pour obtenir des suggestions basées sur le contexte
  async getSuggestions(message: string, userRole?: string): Promise<string[]> {
    const context = this.projectContextService.detectContext(message);
    return this.projectContextService.getQuickResponses(context);
  }

  // Méthode pour réinitialiser le contexte de conversation
  async resetConversation(): Promise<void> {
    await this.chatSessionService.updateSession('');
  }
}
