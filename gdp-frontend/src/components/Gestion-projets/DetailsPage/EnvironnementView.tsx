import React from 'react';
import Image from 'next/image';
import { Environnement } from '@/services/Project';

interface EnvironnementViewProps {
  environnements: Environnement[];
  projectName: string;
}

const EnvironnementView: React.FC<EnvironnementViewProps> = ({ environnements, projectName }) => {
  return (
    <div className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex items-start space-x-8 w-full justify-center">
        {/* Projet */}
        <div className="flex flex-col items-center mr-4">
          <Image
            src="/images/icon/projet.jpg"
            alt="Projet"
            width={48}
            height={48}
            className="rounded-full mb-2"
          />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white text-center">
            {projectName}
          </h2>
        </div>

        {/* Flèche ou Message */}
        {environnements.length > 0 ? (
          <>
            <div className="text-2xl text-gray-500 dark:text-gray-300">
              &#x2192;
            </div>
            <div className="flex items-center space-x-4">
              {environnements.map((environnement, index) => (
                <React.Fragment key={environnement.id}>
                  <div className="flex flex-col items-center relative">
                    <Image
                      src="/images/logo/logo.png"
                      alt="Logo"
                      width={48}
                      height={48}
                      className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    />
                    <Image
                      src="/images/icon/serveur.jpg"
                      alt="Serveur"
                      width={60}
                      height={60}
                      className="rounded-full mb-2"
                    />
                    <div className="text-center">
                      <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300">
                        {environnement.nomServeur}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">OS: {environnement.systemeExploitation}</p>
                      <p className="text-gray-600 dark:text-gray-400">IP: {environnement.ipServeur}</p>
                      <p className="text-gray-600 dark:text-gray-400">CPU: {environnement.cpu}</p>
                      <p className="text-gray-600 dark:text-gray-400">RAM: {environnement.ram}</p>
                      <p className="text-gray-600 dark:text-gray-400">Stockage: {environnement.stockage}</p>
                    </div>
                  </div>
                  {index < environnements.length - 1 && (
                    <div className="h-12 w-px bg-gray-500 dark:bg-gray-300 mx-2"></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </>
        ) : (
          <div className="text-sg mt-14 text-gray-500 dark:text-gray-300">
            Aucun environnement disponible
          </div>
        )}
      </div>
    </div>
  );
};

export default EnvironnementView;
