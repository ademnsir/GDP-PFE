"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiClock, FiList, FiTrendingUp, FiAward, FiActivity } from 'react-icons/fi';

interface SprintAnalysisProps {
  done: number;
  inProgress: number;
  toDo: number;
  totalTasks: number;
}

const SprintAnalysis: React.FC<SprintAnalysisProps> = ({
  done,
  inProgress,
  toDo,
  totalTasks,
}) => {
  const completionRate = totalTasks > 0 ? Math.round((done / totalTasks) * 100) : 0;
  const progressRate = totalTasks > 0 ? Math.round((inProgress / totalTasks) * 100) : 0;

  const statCards = [
    {
      title: "Tâches terminées",
      value: done,
      icon: FiCheckCircle,
      color: "from-green-500 to-emerald-600",
      percentage: completionRate,
    },
    {
      title: "En cours",
      value: inProgress,
      icon: FiClock,
      color: "from-blue-500 to-indigo-600",
      percentage: progressRate,
    },
    {
      title: "À faire",
      value: toDo,
      icon: FiList,
      color: "from-red-500 to-pink-600",
      percentage: totalTasks > 0 ? Math.round((toDo / totalTasks) * 100) : 0,
    },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* En-tête compact */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4"
      >
        <motion.div
          className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mb-2"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <FiActivity className="w-6 h-6 text-white" />
        </motion.div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Analyse du Sprint</h2>
      </motion.div>

      {/* Cartes de statistiques en grille compacte */}
      <div className="grid grid-cols-1 gap-3 mb-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative rounded-lg bg-white dark:bg-boxdark-2 p-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{stat.value}</h3>
              </div>
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Barre de progression animée */}
            <div className="mt-2 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stat.percentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full bg-gradient-to-r ${stat.color}`}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {stat.percentage}% du total
            </p>
          </motion.div>
        ))}
      </div>

      {/* Carte de performance globale compacte */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-3"
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-base font-semibold text-white">Performance Globale</h3>
            <p className="text-sm text-purple-100">Total: {totalTasks} tâches</p>
          </div>
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
          >
            <FiAward className="w-5 h-5 text-white" />
          </motion.div>
        </div>

        {/* Indicateur de progression circulaire compact */}
        <div className="flex items-center">
          <div className="relative w-16 h-16">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <motion.path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <motion.path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#fff"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: completionRate / 100 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-sm font-bold">{completionRate}%</span>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <div className="h-1.5 bg-white/20 rounded-full">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
            <p className="text-xs text-white mt-1">Taux de complétion global</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SprintAnalysis;
