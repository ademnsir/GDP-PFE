"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Conge } from "@/services/conge";
import { fetchCongesByMonth } from "@/services/conge";

interface CongestatViewProps {
  selectedMonth?: string;
}

const getFullMonthName = (month: string): string => {
  const months: { [key: string]: string } = {
    "Jan": "Janvier",
    "Feb": "Février",
    "Mar": "Mars",
    "Apr": "Avril",
    "May": "Mai",
    "Jun": "Juin",
    "Jul": "Juillet",
    "Aug": "Août",
    "Sep": "Septembre",
    "Oct": "Octobre",
    "Nov": "Novembre",
    "Dec": "Décembre"
  };
  return months[month] || month;
};

export default function CongestatView({ selectedMonth }: CongestatViewProps) {
  const [conges, setConges] = useState<Conge[]>([]);

  useEffect(() => {
    const loadConges = async () => {
      if (!selectedMonth) {
        setConges([]);
        return;
      }
      try {
        const data = await fetchCongesByMonth(selectedMonth);
        setConges(data);
      } catch (err) {
        console.error("Erreur lors du chargement des congés:", err);
        setConges([]);
      }
    };

    loadConges();
  }, [selectedMonth]);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {selectedMonth ? `Congés - ${getFullMonthName(selectedMonth)}` : 'Liste des Congés'}
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Période</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reprise</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {conges.length > 0 ? (
              conges.map((conge) => (
                <tr
                  key={conge.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden">
                        <Image
                          src={
                            conge.photo
                              ? conge.photo.startsWith('https://lh3.googleusercontent.com')
                                ? conge.photo
                                : `${process.env.NEXT_PUBLIC_BACKEND_URL}${conge.photo}`
                              : "/images/user/user1.jpg"
                          }
                          alt={`${conge.firstName} ${conge.lastName}`}
                          width={32}
                          height={32}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/images/user/user1.jpg";
                          }}
                          unoptimized={true}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {conge.firstName} {conge.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{conge.matricule}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {conge.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-900 dark:text-white">{conge.service}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <p className="text-gray-900 dark:text-white">{new Date(conge.startDate).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-500">au</p>
                      <p className="text-gray-900 dark:text-white">{new Date(conge.endDate).toLocaleDateString()}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {new Date(conge.dateReprise).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {conge.status === 'APPROVED' && (
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">Validé</span>
                    )}
                    {conge.status === 'PENDING' && (
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">En attente</span>
                    )}
                    {conge.status === 'REJECTED' && (
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">Refusé</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                    <p className="text-sm font-medium">
                      {selectedMonth 
                        ? "Aucun congé trouvé pour ce mois" 
                        : "Sélectionnez un mois pour afficher la liste des congés"}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
