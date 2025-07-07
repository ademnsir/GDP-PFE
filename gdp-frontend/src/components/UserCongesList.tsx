"use client";

import { useState, useEffect } from "react";
import { fetchAllCongesByMatricule, cancelConge, Conge, CongeStatus } from "@/services/conge";
import { getUserData } from "@/services/authService";
import { motion } from "framer-motion";
import { FiCalendar, FiClock, FiCheck, FiX, FiDownload, FiTrash2 } from "react-icons/fi";
import Image from "next/image";
import axiosInstance from "@/services/axiosInstance";

interface UserCongesListProps {
  onCongeUpdate?: () => void;
}

const UserCongesList = ({ onCongeUpdate }: UserCongesListProps) => {
  const [conges, setConges] = useState<Conge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [cancelingId, setCancelingId] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadUserConges();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadUserConges = async () => {
    setLoading(true);
    setError("");
    try {
      const userData = getUserData();
      if (userData?.matricule) {
        const data = await fetchAllCongesByMatricule(userData.matricule);
        // Trier les congés par date de création (plus récents en premier)
        const sortedConges = data.sort((a, b) => 
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        );
        setConges(sortedConges);
      } else {
        setError("Matricule non trouvé");
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des congés");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelConge = async (congeId: number) => {
    if (!congeId) return;
    
    if (!window.confirm("Êtes-vous sûr de vouloir annuler cette demande de congé ?")) {
      return;
    }
    
    setCancelingId(congeId);
    try {
      await cancelConge(congeId);
      // Recharger la liste après annulation
      await loadUserConges();
      // Notifier le parent pour rafraîchir les statistiques
      if (onCongeUpdate) {
        onCongeUpdate();
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'annulation du congé");
    } finally {
      setCancelingId(null);
    }
  };

  const handleDownloadPDF = async (congeId: number) => {
    if (!congeId) return;
    setDownloadingId(congeId);
    try {
      const response = await axiosInstance.get(`/conges/download-pdf/${congeId}`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `demande_conge_${congeId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || "Erreur lors du téléchargement du PDF");
    } finally {
      setDownloadingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const now = currentTime;
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInDays === 1) return "Hier";
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
    return formatDate(dateString);
  };

  const getStatusBadgeClass = (status: CongeStatus) => {
    switch (status) {
      case CongeStatus.APPROVED:
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case CongeStatus.REJECTED:
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
    }
  };

  const getStatusIcon = (status: CongeStatus) => {
    switch (status) {
      case CongeStatus.APPROVED:
        return <FiCheck className="w-4 h-4" />;
      case CongeStatus.REJECTED:
        return <FiX className="w-4 h-4" />;
      default:
        return <FiClock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: CongeStatus) => {
    switch (status) {
      case CongeStatus.APPROVED:
        return "Approuvé";
      case CongeStatus.REJECTED:
        return "Refusé";
      default:
        return "En attente";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-100 p-6 text-red-700 dark:bg-red-900/20 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (conges.length === 0) {
    return (
      <div className="text-center py-12">
        <FiCalendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Aucun congé trouvé</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-black dark:text-white">
          Mes demandes de congé
        </h3>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
          {conges.length} demande{conges.length > 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="space-y-3">
        {conges.map((conge, index) => (
          <motion.div
            key={conge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-white dark:hover:bg-gray-800"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-gray-700">
                    {conge.photo ? (
                      <Image
                        src={
                          process.env.NEXT_PUBLIC_BACKEND_URL
                            ? new URL(conge.photo, process.env.NEXT_PUBLIC_BACKEND_URL).toString()
                            : conge.photo
                        }
                        alt={`${conge.firstName} ${conge.lastName}`}
                        width={40}
                        height={40}
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/user/user1.jpg";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <FiCalendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-black dark:text-white truncate">
                      {conge.type}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full py-0.5 px-2 text-xs font-medium ${getStatusBadgeClass(
                        conge.status
                      )}`}
                    >
                      {getStatusIcon(conge.status)}
                      {getStatusText(conge.status)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-2">
                      <FiCalendar className="w-3 h-3" />
                      Du {formatDate(conge.startDate)}
                    </span>
                    <span className="flex items-center gap-2">
                      <FiCalendar className="w-3 h-3" />
                      Au {formatDate(conge.endDate)}
                    </span>
                    <span className="flex items-center gap-2">
                      <FiClock className="w-3 h-3" />
                      Reprise: {formatDate(conge.dateReprise)}
                    </span>
                    <span className="flex items-center gap-2">
                      <FiClock className="w-3 h-3" />
                      Soumis: 
                      <span 
                        className="cursor-help" 
                        title={conge.createdAt ? formatDateTime(conge.createdAt) : "Date non disponible"}
                      >
                        {formatRelativeTime(conge.createdAt || '')}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Bouton d'annulation pour les congés en attente */}
                {conge.status === CongeStatus.PENDING && (
                  <button
                    onClick={() => handleCancelConge(conge.id)}
                    disabled={cancelingId === conge.id}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Annuler la demande"
                  >
                    {cancelingId === conge.id ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-500"></div>
                    ) : (
                      <FiTrash2 className="w-4 h-4" />
                    )}
                  </button>
                )}
                
                <button
                  onClick={() => handleDownloadPDF(conge.id)}
                  disabled={downloadingId === conge.id}
                  className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Télécharger PDF"
                >
                  {downloadingId === conge.id ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                  ) : (
                    <FiDownload className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default UserCongesList; 