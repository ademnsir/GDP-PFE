import { useState, useEffect } from "react";
import axiosInstance from "@/services/axiosInstance"; 
import { motion, AnimatePresence } from "framer-motion";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (emails: string[]) => void; // Accepter un tableau d'emails
  assignedUsers: User[];
  modalType: "DEVELOPPER" | "INFRA" | null;
}

const Modal = ({ isOpen, onClose, onSubmit, assignedUsers, modalType }: ModalProps) => {
  const [emailInput, setEmailInput] = useState("");
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]); // Stocker les emails sélectionnés
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<User[]>([]);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Réinitialiser le modal lorsqu'il est fermé
  useEffect(() => {
    if (!isOpen) {
      setEmailInput("");
      setSelectedEmails([]);
      setErrorMessages([]);
      setSuccessMessage(null);
      setFilteredSuggestions([]);
    }
  }, [isOpen]);

  // Récupérer les utilisateurs depuis l'API
  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        setLoading(true);
        setErrorMessages([]);
  
        try {
          const response = await axiosInstance.get('/users/all');
          setSuggestions(response.data); // Pas besoin de .json() avec axios
        } catch (error) {
          console.error("Erreur lors de la récupération des utilisateurs:", error);
          setErrorMessages([
            "Erreur lors de la récupération des utilisateurs. Veuillez réessayer.",
          ]);
        } finally {
          setLoading(false);
        }
      };
  
      fetchUsers();
    }
  }, [isOpen]);

  // Filtrer les suggestions en fonction de la saisie
  useEffect(() => {
    if (emailInput) {
      const filtered = suggestions.filter((user) =>
        user.email.toLowerCase().includes(emailInput.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }
  }, [emailInput, suggestions]);

  // Gérer la sélection d'une suggestion
  const handleSelectSuggestion = (email: string) => {
    if (!selectedEmails.includes(email)) {
      setSelectedEmails((prev) => [...prev, email]); // Ajouter l'email sélectionné
    }
    setEmailInput(""); // Réinitialiser le champ de saisie
    setFilteredSuggestions([]); // Masquer les suggestions après sélection
  };

  // Gérer la suppression d'un email sélectionné
  const handleRemoveEmail = (email: string) => {
    setSelectedEmails((prev) => prev.filter((e) => e !== email));
  };

  // Gérer la soumission du formulaire
  const handleSubmit = () => {
    if (!modalType) return;
  
    const errors: string[] = [];
  
    selectedEmails.forEach((email) => {
      const selectedUser = suggestions.find(
        (user) => user.email.toLowerCase() === email.toLowerCase()
      );
  
      if (!selectedUser) {
        errors.push(`Utilisateur avec l'email ${email} non trouvé.`);
      } else if (selectedUser.role !== "ADMIN" && selectedUser.role !== modalType) {
        // Si l'utilisateur n'est pas un ADMIN et que son rôle ne correspond pas au type de modal
        errors.push(
          `${selectedUser.firstName} ${selectedUser.lastName} n'est pas un ${modalType}.`
        );
      } else if (
        assignedUsers.some((user) => user.email.toLowerCase() === email.toLowerCase())
      ) {
        errors.push(
          `L'utilisateur ${selectedUser.firstName} ${selectedUser.lastName} est déjà assigné à ce projet.`
        );
      }
    });
  
    if (errors.length > 0) {
      setErrorMessages(errors);
      return;
    }
  
    onSubmit(selectedEmails); // Soumettre les emails sélectionnés
    setErrorMessages([]);
    setSelectedEmails([]);
    onClose(); // Fermer le modal après la soumission
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white p-8 rounded-xl shadow-2xl w-[500px] max-h-[80vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Assigner des utilisateurs</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Rechercher un utilisateur..."
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              {loading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>

            {filteredSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 p-3 rounded-lg max-h-[200px] overflow-y-auto shadow-inner"
              >
                {filteredSuggestions.map((user) => (
                  <motion.div
                    key={user.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleSelectSuggestion(user.email)}
                    className="cursor-pointer p-2 hover:bg-white rounded-md flex items-center justify-between transition-colors duration-200"
                  >
                    <span className="text-gray-700">{user.email}</span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        user.role === "DEVELOPPER"
                          ? "bg-emerald-100 text-emerald-800"
                          : user.role === "INFRA"
                          ? "bg-indigo-100 text-indigo-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {selectedEmails.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4"
              >
                <p className="text-sm font-medium text-gray-600 mb-2">Utilisateurs sélectionnés :</p>
                <div className="flex flex-wrap gap-2">
                  {selectedEmails.map((email) => (
                    <motion.div
                      key={email}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1.5 rounded-full flex items-center gap-2"
                    >
                      <span>{email}</span>
                      <button
                        onClick={() => handleRemoveEmail(email)}
                        className="text-blue-500 hover:text-blue-700 transition-colors"
                      >
                        ×
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {errorMessages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-3"
              >
                {errorMessages.map((error, index) => (
                  <p key={index} className="text-red-600 text-sm">
                    {error}
                  </p>
                ))}
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-200 rounded-lg p-3"
              >
                <p className="text-green-600 text-sm">{successMessage}</p>
              </motion.div>
            )}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Assigner
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Modal;