"use client";

import React, { useState, useEffect } from "react";
import { fetchAllTachesPeriodiques, TachePeriodique } from "@/services/tacheperiodique";
import TaskModal from "@/components/Gestion-tache-projet/TaskModal";
import { FiChevronLeft, FiChevronRight, FiCalendar, FiClock } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const Calendar = () => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [tasks, setTasks] = useState<TachePeriodique[]>([]);
  const [selectedDayTasks, setSelectedDayTasks] = useState<TachePeriodique[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const daysOfWeek = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const months = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const allTasks = await fetchAllTachesPeriodiques();
        setTasks(allTasks);
      } catch (error) {
        console.error("Erreur lors de la récupération des tâches périodiques :", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const getDaysInMonth = (year: number, month: number) => {
    const days = [];
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDate; i++) {
      days.push(i);
    }

    return days;
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getTasksForDay = (day: number) => {
    return tasks.filter((task) => {
      if (!task.sendDate) return false;
      const taskDate = new Date(task.sendDate);
      const currentDate = new Date(currentYear, currentMonth, day);
      const dayOfWeek = currentDate.getDay();

      // Pour les tâches mensuelles, ne pas afficher dans les années suivantes ni dans les mois et années précédents
      if (task.periodicite === 'MENSUEL' && 
          (currentYear > taskDate.getFullYear() || 
           currentYear < taskDate.getFullYear() ||
           (currentYear === taskDate.getFullYear() && currentMonth < taskDate.getMonth()))) {
        return false;
      }

      // Pour les tâches annuelles, ne pas afficher dans les années précédentes
      if (task.periodicite === 'ANNUEL' && currentYear < taskDate.getFullYear()) {
        return false;
      }

      // Pour les tâches mensuelles, annuelles et quotidiennes, vérifier si la date tombe un weekend
      if ((task.periodicite === 'MENSUEL' || task.periodicite === 'ANNUEL' || task.periodicite === 'QUOTIDIEN') && 
          (currentDate.getDay() === 0 || currentDate.getDay() === 6)) {
        // Calculer la date du lundi suivant
        const nextMonday = new Date(currentDate);
        if (currentDate.getDay() === 0) { // Dimanche
          nextMonday.setDate(currentDate.getDate() + 1);
        } else { // Samedi
          nextMonday.setDate(currentDate.getDate() + 2);
        }
        
        // Vérifier si la date actuelle correspond au lundi suivant
        return nextMonday.getFullYear() === currentYear &&
               nextMonday.getMonth() === currentMonth &&
               nextMonday.getDate() === day;
      }

      switch (task.periodicite) {
        case 'QUOTIDIEN':
          return taskDate.getFullYear() === currentYear && 
                 (currentMonth > taskDate.getMonth() || 
                  (currentMonth === taskDate.getMonth() && day >= taskDate.getDate()));
        case 'MENSUEL':
          // Pour les tâches mensuelles, vérifier si la date tombe un weekend
          const monthlyDate = new Date(currentYear, currentMonth, taskDate.getDate());
          if (monthlyDate.getDay() === 0 || monthlyDate.getDay() === 6) {
            const nextMonday = new Date(monthlyDate);
            if (monthlyDate.getDay() === 0) {
              nextMonday.setDate(monthlyDate.getDate() + 1);
            } else {
              nextMonday.setDate(monthlyDate.getDate() + 2);
            }
            return nextMonday.getDate() === day;
          }
          return taskDate.getDate() === day;
        case 'ANNUEL':
          // Pour les tâches annuelles, vérifier si la date tombe un weekend
          const annualDate = new Date(currentYear, taskDate.getMonth(), taskDate.getDate());
          if (annualDate.getDay() === 0 || annualDate.getDay() === 6) {
            const nextMonday = new Date(annualDate);
            if (annualDate.getDay() === 0) {
              nextMonday.setDate(annualDate.getDate() + 1);
            } else {
              nextMonday.setDate(annualDate.getDate() + 2);
            }
            return nextMonday.getDate() === day;
          }
          // Vérifier si c'est le même jour et le même mois que la date de la tâche
          return taskDate.getMonth() === currentMonth && taskDate.getDate() === day;
        default:
          return (
            taskDate.getFullYear() === currentYear &&
            taskDate.getMonth() === currentMonth &&
            taskDate.getDate() === day
          );
      }
    });
  };

  const days = getDaysInMonth(currentYear, currentMonth);

  const renderEventContent = (eventInfo: any) => {
    const task = tasks.find(t => t.id === eventInfo.event.id);
    if (!task) return null;

    const taskDate = new Date(task.sendDate);
    const isRescheduled = (task.periodicite === 'MENSUEL' || task.periodicite === 'ANNUEL') && 
                         (taskDate.getDay() === 0 || taskDate.getDay() === 6);
    
    return (
      <div className="p-1">
        <div className="font-bold">{eventInfo.event.title}</div>
        <div className="text-sm">
          {task?.periodicite && (
            <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 mr-1">
              {task.periodicite}
            </span>
          )}
          {isRescheduled && (
            <span className="inline-block px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 mr-1">
              Reporté
            </span>
          )}
          {task?.heureExecution && (
            <span className="text-gray-600">
              {task.heureExecution}
            </span>
          )}
        </div>
        {!task?.estActive && (
          <span className="inline-block px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
            Inactive
          </span>
        )}
      </div>
    );
  };

  const eventClick = (info: any) => {
    const task = tasks.find(t => t.id === info.event.id);
    if (task) {
      setSelectedDayTasks([task]);
      setSelectedDate(new Date(currentYear, currentMonth, info.event.start.getDate()));
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 bg-[#2560a0] dark:bg-[#1f4e84] text-white rounded-t-lg">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <FiChevronLeft className="w-5 h-5" />
        </button>
        
        <h2 className="text-lg font-semibold">
          {months[currentMonth]} {currentYear}
        </h2>
        
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <FiChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2560a0] dark:border-[#1f4e84]"></div>
        </div>
      )}

      {/* Calendar Grid */}
      {!isLoading && (
        <div className="bg-white dark:bg-boxdark shadow-sm rounded-b-lg border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-7 border-b dark:border-gray-700">
            {/* Weekday Headers */}
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="p-2 text-center text-sm font-medium text-gray-600 dark:text-gray-300 border-r dark:border-gray-700 last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {/* Calendar Days */}
            {days.map((day, index) => {
              const dayTasks = day !== null ? getTasksForDay(day) : [];
              const isToday = day === new Date().getDate() && 
                            currentMonth === new Date().getMonth() && 
                            currentYear === new Date().getFullYear();

              return (
                <div
                  key={index}
                  className={`min-h-[100px] p-2 border-r border-b dark:border-gray-700 last:border-r-0 relative ${
                    day ? "hover:bg-gray-50 dark:hover:bg-gray-800" : "bg-gray-50 dark:bg-gray-800"
                  } transition-colors`}
                  onClick={() => {
                    if (day && dayTasks.length > 0) {
                      setSelectedDayTasks(dayTasks);
                      setSelectedDate(new Date(currentYear, currentMonth, day));
                    }
                  }}
                >
                  {day && (
                    <>
                      <div className={`inline-flex items-center justify-center w-7 h-7 rounded-full mb-1 ${
                        isToday 
                          ? "bg-[#2560a0] dark:bg-[#1f4e84] text-white" 
                          : "text-gray-700 dark:text-gray-300"
                      }`}>
                        {day}
                      </div>
                      
                      {dayTasks.length > 0 && (
                        <div className="space-y-1">
                          {dayTasks.slice(0, 2).map((task, idx) => (
                            <div
                              key={idx}
                              className="text-xs p-1 rounded bg-blue-50 dark:bg-blue-900/30 text-[#2560a0] dark:text-blue-300 border border-blue-100 dark:border-blue-800 truncate cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                            >
                              <div className="flex items-center gap-1">
                                <FiCalendar className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{task.title}</span>
                              </div>
                            </div>
                          ))}
                          {dayTasks.length > 2 && (
                            <div className="text-xs text-[#2560a0] dark:text-blue-300 pl-1">
                              +{dayTasks.length - 2} autres
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Task Modal */}
      <AnimatePresence>
        {selectedDayTasks.length > 0 && selectedDate && (
          <TaskModal
            tasks={selectedDayTasks}
            selectedDate={selectedDate}
            onClose={() => {
              setSelectedDayTasks([]);
              setSelectedDate(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Calendar;
