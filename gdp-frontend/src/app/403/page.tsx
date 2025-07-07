"use client";

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const ForbiddenPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-boxdark">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-9xl font-bold text-[#2560a0] dark:text-white">403</h1>
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
            Accès Refusé
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Désolé, vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-[#2560a0] text-white rounded-lg hover:bg-[#1e4d7d] transition-colors duration-300"
          >
            Retour à l&apos;accueil
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default ForbiddenPage; 