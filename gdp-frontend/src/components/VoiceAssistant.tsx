"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Mic, X, MessageSquare, Send, Loader2, Volume2, VolumeX, ArrowRight, HelpCircle, Navigation, Settings, FileText, Home } from "lucide-react";
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Message {
  sender: string;
  text: string;
}

const VoiceAssistant: React.FC = () => {
  const router = useRouter();
  const { firstName, lastName } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [lastAiMessage, setLastAiMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [chatMode, setChatMode] = useState<'voice' | 'text'>('voice');
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);

  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const hasInitializedRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const speak = useCallback((text: string) => {
    if (isMuted) return;
    
    if (speechUtteranceRef.current) {
      speechUtteranceRef.current.text = text;
      window.speechSynthesis.speak(speechUtteranceRef.current);
    }
  }, [isMuted]);

  const sendMessageToBackend = useCallback(async (message: string) => {
    try {
      setIsTyping(true);
      
      // Détecter le contexte du message côté frontend
      const lowerMessage = message.toLowerCase();
      let contextHint = '';
      
      if (lowerMessage.includes('tâche') || lowerMessage.includes('task') || lowerMessage.includes('help me with this tache')) {
        contextHint = 'task';
      } else if (lowerMessage.includes('projet') || lowerMessage.includes('project') || lowerMessage.includes('tu sais mon projet')) {
        contextHint = 'project';
      } else if (lowerMessage.includes('utilisateur') || lowerMessage.includes('user')) {
        contextHint = 'user';
      } else if (lowerMessage.includes('environnement') || lowerMessage.includes('serveur')) {
        contextHint = 'environment';
      } else if (lowerMessage.includes('problème') || lowerMessage.includes('erreur') || lowerMessage.includes('help')) {
        contextHint = 'troubleshooting';
      }
      
      console.log('🎯 Contexte détecté côté frontend:', contextHint);
      
      const response = await fetch("http://localhost:3000/google-ai/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      
      // Traitement spécial selon le contexte
      let processedResponse = data.response;
      
      if (contextHint === 'project' && lowerMessage.includes('tu sais mon projet')) {
        processedResponse = `Oui, je connais parfaitement votre projet GDP ! 🚀 

C'est une application de gestion de projets pour WifakBank qui inclut :

📊 **Dashboard** - Vue d'ensemble des projets et métriques
🚀 **Gestion de Projets** - Création, suivi, modification
✅ **Gestion de Tâches** - Assignation et suivi des statuts
👥 **Gestion d'Utilisateurs** - Comptes, rôles, permissions
🖥️ **Environnements** - Serveurs et configurations
📝 **Checklists** - Suivi des étapes de projet
🏖️ **Congés** - Gestion des demandes
🐛 **Problèmes** - Signalement et suivi

Que souhaitez-vous faire spécifiquement ? Je peux vous guider pour n'importe quelle fonctionnalité !`;
      }
      
      if (contextHint === 'task' && (lowerMessage.includes('créer une tâche') || lowerMessage.includes('create task'))) {
        processedResponse = `Pour créer une tâche en tant que développeur :\n1. Rendez-vous dans la section \"Mes Tâches\" 📝 ou \"Gestion des Tâches\" (ou \"Mes Tableaux de Travail\" selon votre vue)\n2. Sélectionnez le projet ou le tableau concerné\n3. Cliquez sur le bouton \"Créer tâche\"\n4. Remplissez les détails de la tâche (titre, description, priorité, échéance)\n5. Sauvegardez la tâche.`;
      }
      
      setMessages((prev) => [...prev, { sender: "WifakBankAI", text: processedResponse }]);
      setLastAiMessage(processedResponse);
      speak(processedResponse);
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Réponse de fallback contextuelle
      const fallbackResponse = `Je suis là pour vous aider ! 💡 

Voici ce que je peux faire pour vous :

🎯 **Navigation** - Dites "aller à dashboard" ou "aller à projets"
✅ **Tâches** - Je peux vous aider avec la gestion des tâches
🚀 **Projets** - Questions sur les projets et leur gestion
👥 **Utilisateurs** - Gestion des comptes et permissions
🖥️ **Environnements** - Configuration des serveurs
🐛 **Problèmes** - Résolution de problèmes techniques

Que souhaitez-vous faire ?`;
      
      setMessages((prev) => [...prev, { sender: "WifakBankAI", text: fallbackResponse }]);
      setLastAiMessage(fallbackResponse);
      speak(fallbackResponse);
    } finally {
      setIsTyping(false);
    }
  }, [speak]);

  const navigationKeywords = [
    { keywords: ["mes tâches", "mes taches", "mes sprints", "mes tableaux de travail", "my tasks", "my sprints", "my boards"], route: "/mes-sprints" },
    { keywords: ["dashboard"], route: "/Dashboard" },
    { keywords: ["projets", "projects"], route: "/mes-projets" },
    { keywords: ["tâches", "taches", "tasks"], route: "/mes-sprints" },
    { keywords: ["utilisateurs", "users"], route: "/list-Users" },
    { keywords: ["congés", "leaves"], route: "/conges" },
    { keywords: ["problèmes", "problemes", "problems"], route: "/problemes" },
  ];

  const handleNavigation = useCallback((transcript: string) => {
    const normalizedTranscript = transcript.toLowerCase();
    for (const nav of navigationKeywords) {
      if (nav.keywords.some(keyword => normalizedTranscript.includes(keyword))) {
        router.push(nav.route);
        let destination = nav.route === "/mes-sprints" ? "vos sprints/tableaux de travail" : nav.route.replace("/", "");
        const response = `Je vous redirige vers la page ${destination}`;
        setMessages((prev) => [...prev, { sender: "WifakBankAI", text: response }]);
        setLastAiMessage(response);
        speak(response);
        return true;
      }
    }
    return false;
  }, [router, speak]);

  // Initialize speech recognition and synthesis
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition !== undefined) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = "fr-FR";

      recognitionInstance.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        setMessages((prev) => [...prev, { sender: firstName && lastName ? `${firstName} ${lastName}` : "Utilisateur", text: transcript }]);

        // Try navigation first
        const navigated = handleNavigation(transcript);
        
        if (!navigated) {
          if (transcript.includes("je m'appelle") || transcript.includes("mon nom")) {
            const nameResponse = firstName && lastName
              ? `Tu t'appelles ${firstName} ${lastName}.`
              : "Je ne connais pas encore ton nom.";

            setMessages((prev) => [...prev, { sender: "WifakBankAI", text: nameResponse }]);
            setLastAiMessage(nameResponse);
            speak(nameResponse);
          } else {
            await sendMessageToBackend(transcript);
          }
        }
      };

      setRecognition(recognitionInstance);
    }

    const utterance = new SpeechSynthesisUtterance();
    utterance.voice = window.speechSynthesis.getVoices()[0];
    utterance.lang = "fr-FR";
    speechUtteranceRef.current = utterance;

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [firstName, lastName, sendMessageToBackend, speak, handleNavigation]);

  // Initial greeting
  useEffect(() => {
    if (firstName && lastName && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      const greeting = `Bonjour ${firstName} ${lastName}, comment puis-je vous aider ?`;
      setMessages([{ sender: "WifakBankAI", text: greeting }]);
      setLastAiMessage(greeting);
    }
  }, [firstName, lastName]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputMessage.trim()) return;

    const message = inputMessage;
    setInputMessage("");
    setMessages((prev) => [...prev, { sender: firstName && lastName ? `${firstName} ${lastName}` : "Utilisateur", text: message }]);
    
    // Check if the message is a navigation command
    const navigated = handleNavigation(message);
    
    // If it's not a navigation command, send it to the backend
    if (!navigated) {
      await sendMessageToBackend(message);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      const newState = !prev;
      if (newState) {
        window.speechSynthesis.cancel();
      } else {
        if (lastAiMessage) {
          setTimeout(() => speak(lastAiMessage), 500);
        }
      }
      return newState;
    });
  };

  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
    if (!isChatOpen) {
      setShowWelcomeScreen(true);
    }
  };

  const welcomeOptions = [
    {
      icon: <Navigation className="w-6 h-6" />,
      title: "Navigation",
      description: "Besoin d'une direction vers une page spécifique ?",
      action: () => {
        setShowWelcomeScreen(false);
        setInputMessage("aller à");
        setChatMode('text');
      }
    },
    {
      icon: <HelpCircle className="w-6 h-6" />,
      title: "Résolution de problèmes",
      description: "Avez-vous besoin d'aide pour résoudre un problème ?",
      action: () => {
        setShowWelcomeScreen(false);
        setMessages([{ sender: "WifakBankAI", text: "Décrivez-moi le problème que vous rencontrez, je ferai de mon mieux pour vous aider." }]);
      }
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: "Configuration",
      description: "Besoin d'aide pour configurer quelque chose ?",
      action: () => {
        setShowWelcomeScreen(false);
        setMessages([{ sender: "WifakBankAI", text: "Quelle configuration souhaitez-vous modifier ? Je peux vous guider." }]);
      }
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Documentation",
      description: "Recherche d'informations ou de documentation ?",
      action: () => {
        setShowWelcomeScreen(false);
        setMessages([{ sender: "WifakBankAI", text: "Quel type d'information recherchez-vous ? Je peux vous aider à trouver la documentation appropriée." }]);
      }
    }
  ];

  return (
    <>
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-blue-600 p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-110 dark:bg-blue-700 dark:hover:bg-blue-800"
      >
        <MessageSquare className="text-white w-6 h-6" />
      </button>

      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-96 bg-white shadow-xl rounded-lg overflow-hidden transform transition-all duration-300 dark:bg-boxdark dark:border dark:border-strokedark">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 flex items-center justify-between dark:from-blue-700 dark:to-blue-900">
            <div className="flex items-center space-x-3">
              <Image
                src="/images/logo/mini-logo.png"
                alt="WifakBankAI"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full border-2 border-white"
              />
              <div>
                <h3 className="text-white font-semibold">WifakBankAI</h3>
                <p className="text-blue-100 text-sm">Assistant virtuel</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!showWelcomeScreen && (
                <button
                  onClick={() => setShowWelcomeScreen(true)}
                  className="text-white hover:text-blue-200 transition-colors p-2 rounded-full bg-blue-500/20 dark:bg-blue-600/20"
                  title="Retour à l'accueil"
                >
                  <Home className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={toggleMute}
                className="text-white hover:text-blue-200 transition-colors p-2 rounded-full bg-blue-500/20 dark:bg-blue-600/20"
                title={isMuted ? "Activer le son" : "Désactiver le son"}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <button onClick={toggleChat} className="text-white hover:text-blue-200 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {showWelcomeScreen ? (
            <div className="p-4 h-96 overflow-y-auto bg-gray-50 dark:bg-boxdark-2">
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => {
                    setShowWelcomeScreen(false);
                    setMessages([{ 
                      sender: "WifakBankAI", 
                      text: "Bonjour ! Comment puis-je vous aider aujourd'hui ?" 
                    }]);
                  }}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center space-x-2"
                >
                  <span>Passer</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Comment puis-je vous aider ?</h2>
                <p className="text-gray-600 dark:text-gray-400">Sélectionnez une option ci-dessous pour commencer</p>
              </div>
              <div className="space-y-4">
                {welcomeOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={option.action}
                    className="w-full p-4 bg-white dark:bg-boxdark rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex items-center space-x-4 group hover:bg-blue-50 dark:hover:bg-blue-900/30"
                  >
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50">
                      {option.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-medium text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {option.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {option.description}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 h-96 overflow-y-auto bg-gray-50 dark:bg-boxdark-2">
                {messages.map((msg, index) => (
                  <div key={index} className={`mb-4 ${msg.sender === "WifakBankAI" ? "text-left" : "text-right"}`}>
                    <div className={`inline-block max-w-[80%] rounded-2xl p-3 ${
                      msg.sender === "WifakBankAI" 
                        ? "bg-blue-100 text-gray-800 rounded-tl-none dark:bg-blue-900/30 dark:text-white" 
                        : "bg-blue-600 text-white rounded-tr-none dark:bg-blue-700"
                    }`}>
                      <p className="text-sm">{msg.text}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">{msg.sender}</p>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="bg-blue-100 rounded-2xl p-3 rounded-tl-none dark:bg-blue-900/30">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce dark:bg-blue-400" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce dark:bg-blue-400" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce dark:bg-blue-400" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="bg-white border-t p-3 dark:bg-boxdark dark:border-t dark:border-strokedark">
                <div className="flex items-center space-x-2 mb-2">
                  <button
                    onClick={() => setChatMode('text')}
                    className={`flex-1 py-2 rounded-lg transition-colors ${
                      chatMode === 'text' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-boxdark-2 dark:text-gray-400'
                    }`}
                  >
                    <MessageSquare className="w-5 h-5 mx-auto" />
                  </button>
                  <button
                    onClick={() => setChatMode('voice')}
                    className={`flex-1 py-2 rounded-lg transition-colors ${
                      chatMode === 'voice' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-boxdark-2 dark:text-gray-400'
                    }`}
                  >
                    <Mic className="w-5 h-5 mx-auto" />
                  </button>
                </div>

                {chatMode === 'text' ? (
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Tapez votre message..."
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-boxdark-2 dark:border-strokedark dark:text-white dark:focus:ring-blue-600"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!inputMessage.trim() || isTyping}
                      className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-700 dark:hover:bg-blue-800"
                    >
                      {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <button
                      onClick={toggleListening}
                      className={`flex-1 py-2 rounded-lg transition-colors ${
                        isListening ? 'bg-red-500 text-white dark:bg-red-600' : 'bg-blue-600 text-white dark:bg-blue-700 dark:hover:bg-blue-800'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <Mic className="w-5 h-5" />
                        <span>{isListening ? "Arrêter" : "Parler"}</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes wave {
          0% { transform: scale(0.5); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(2); opacity: 0; }
        }

        .wave {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.5);
          animation: wave 1.5s infinite ease-out;
        }

        .wave:nth-child(2) { animation-delay: 0.3s; }
        .wave:nth-child(3) { animation-delay: 0.6s; }
      `}</style>
    </>
  );
};

export default VoiceAssistant;
