"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { fetchAllConges, updateCongeStatus, CongeStatus, Conge } from "@/services/conge";
import { motion } from "framer-motion";
import { FiCheck, FiX, FiDownload, FiRefreshCw, FiUser } from "react-icons/fi";
import axiosInstance from "@/services/axiosInstance";
import Image from "next/image";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { getUserRole } from "@/services/authService";
import { useRouter } from "next/navigation";

const ListConges = () => {
  const [conges, setConges] = useState<Conge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const role = getUserRole();
    if (role !== "ADMIN") {
      router.replace("/403");
      return;
    }
    loadConges();
  }, []);

  const loadConges = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAllConges();
      setConges(data);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des congés");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, newStatus: CongeStatus) => {
    try {
      await updateCongeStatus(id, newStatus);
      await loadConges(); // Reload the list after update
    } catch (err: any) {
      setError(err.message || "Erreur lors de la mise à jour du statut");
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

  const getStatusBadgeClass = (status: CongeStatus) => {
    switch (status) {
      case CongeStatus.APPROVED:
        return "bg-green-100 text-green-800";
      case CongeStatus.REJECTED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Liste des Demandes de Congé" />

      <div className="rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Toutes les demandes
          </h4>
          <button
            onClick={loadConges}
            className="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary py-2 px-6 text-white hover:bg-opacity-90"
          >
            <FiRefreshCw className="h-4 w-4" />
            Rafraîchir
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  <th className="py-4 px-4 font-medium text-black dark:text-white">
                    Photo
                  </th>
                  <th className="py-4 px-4 font-medium text-black dark:text-white">
                    Employé
                  </th>
                  <th className="py-4 px-4 font-medium text-black dark:text-white">
                    Type
                  </th>
                  <th className="py-4 px-4 font-medium text-black dark:text-white">
                    Début
                  </th>
                  <th className="py-4 px-4 font-medium text-black dark:text-white">
                    Fin
                  </th>
                  <th className="py-4 px-4 font-medium text-black dark:text-white">
                    Statut
                  </th>
                  <th className="py-4 px-4 font-medium text-black dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {conges.map((conge: any) => (
                  <tr key={conge.id} className="border-b border-[#eee] dark:border-strokedark">
                    <td className="py-5 px-4">
                      <div className="flex items-center justify-center">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-[#2560a0] dark:group-hover:ring-[#d01e3e] transition-all duration-200 shadow-sm">
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
                              <FiUser className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <p className="text-black dark:text-white">
                        {conge.firstName} {conge.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{conge.matricule}</p>
                    </td>
                    <td className="py-5 px-4">
                      <p className="text-black dark:text-white">{conge.type}</p>
                    </td>
                    <td className="py-5 px-4">
                      <p className="text-black dark:text-white">
                        {formatDate(conge.startDate)}
                      </p>
                    </td>
                    <td className="py-5 px-4">
                      <p className="text-black dark:text-white">
                        {formatDate(conge.endDate)}
                      </p>
                    </td>
                    <td className="py-5 px-4">
                      <span
                        className={`inline-flex rounded-full py-1 px-3 text-sm font-medium ${getStatusBadgeClass(
                          conge.status
                        )}`}
                      >
                        {conge.status}
                      </span>
                    </td>
                    <td className="py-5 px-4">
                      <div className="flex items-center space-x-3.5">
                        <button
                          onClick={() =>
                            handleStatusUpdate(conge.id, CongeStatus.APPROVED)
                          }
                          className={`hover:text-primary ${conge.status === CongeStatus.APPROVED ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={conge.status === CongeStatus.APPROVED}
                          title={conge.status === CongeStatus.APPROVED ? 'Déjà approuvé' : 'Approuver'}
                        >
                          <FiCheck className="h-5 w-5 text-green-500" />
                        </button>
                        <button
                          onClick={() =>
                            handleStatusUpdate(conge.id, CongeStatus.REJECTED)
                          }
                          className={`hover:text-primary ${conge.status === CongeStatus.REJECTED ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={conge.status === CongeStatus.REJECTED}
                          title={conge.status === CongeStatus.REJECTED ? 'Déjà refusé' : 'Refuser'}
                        >
                          <FiX className="h-5 w-5 text-red-500" />
                        </button>
                        {conge.status === CongeStatus.PENDING && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(conge.id, CongeStatus.PENDING)
                            }
                            className="hover:text-primary"
                            title="Remettre en attente"
                          >
                            <FiRefreshCw className="h-5 w-5 text-yellow-500" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDownloadPDF(conge.id)}
                          disabled={downloadingId === conge.id}
                          className="hover:text-primary"
                          title="Télécharger PDF"
                        >
                          <FiDownload className="h-5 w-5 text-blue-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default ListConges;


