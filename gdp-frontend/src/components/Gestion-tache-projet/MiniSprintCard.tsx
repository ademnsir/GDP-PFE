"use client";

import React, { useEffect, useState, useContext } from "react";
import Link from "next/link";
import { fetchTasksByProjectId, Task } from "@/services/tache";
import { fetchProjectById, Project } from "@/services/Project";
import Image from "next/image";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { FavoritesContext } from "@/context/FavoritesContext";
import { FiUser } from "react-icons/fi";

interface MiniSprintCardProps {
  projectId: number;
  projectName: string;
  isFavorite: boolean;
  toggleFavorite: (projectId: number) => void;
}

type TaskStatus = "To Do" | "In Progress" | "Done";

const MiniSprintCard: React.FC<MiniSprintCardProps> = ({ projectId, projectName, isFavorite, toggleFavorite }) => {
  const [tasks, setTasks] = useState<Record<TaskStatus, Task[]>>({
    "To Do": [],
    "In Progress": [],
    "Done": [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [animate, setAnimate] = useState(false);
  const { setNotifyingFavorites } = useContext(FavoritesContext);

  useEffect(() => {
    const getProject = async () => {
      try {
        const projectData = await fetchProjectById(projectId);
        setProject(projectData);
      } catch (err) {
        console.error("Error fetching project:", err);
        setError("Failed to fetch project.");
      }
    };

    const getTasks = async () => {
      try {
        const data = await fetchTasksByProjectId(projectId);
        const groupedTasks = data.reduce(
          (acc: Record<TaskStatus, Task[]>, task: Task) => {
            const status = task.status as TaskStatus;
            acc[status] = acc[status] || [];
            acc[status].push(task);
            return acc;
          },
          { "To Do": [], "In Progress": [], "Done": [] }
        );
        setTasks(groupedTasks);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError("Failed to fetch tasks. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    getProject();
    getTasks();
  }, [projectId]);

  useEffect(() => {
    setAnimate(true);
  }, []);

  if (loading) {
    return <p className="text-center text-gray-600 dark:text-gray-300">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  const total = tasks["Done"].length + tasks["In Progress"].length + tasks["To Do"].length;
  const donePercentage = total ? ((tasks["Done"].length / total) * 100).toFixed(0) : "0";
  const inProgressPercentage = total
    ? ((tasks["In Progress"].length / total) * 100).toFixed(0)
    : "0";
  const toDoPercentage = total ? ((tasks["To Do"].length / total) * 100).toFixed(0) : "0";

  return (
    <div className="border rounded p-2 shadow-sm hover:shadow-md transition-shadow duration-300 relative">
      <div className="flex justify-end mb-2">
        <button
          className="text-gray-500 hover:text-blue-500"
          onClick={() => {
            console.log("Toggling favorite:", projectId);
            toggleFavorite(projectId);
            setNotifyingFavorites(true);
          }}
        >
          {isFavorite ? <FaHeart /> : <FaRegHeart />}
        </button>
      </div>
      <Link href={`/tache/Projet/${projectId}`}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden h-48">
          <div className="flex justify-between items-center mb-1 p-1 rounded-md text-white"
            style={{
              background: "linear-gradient(to left, #2560a0, #d01e3e)",
            }}>
            <h3 className="text-sm font-semibold">{projectName}</h3>
            <div className="flex items-center -space-x-1">
              {project?.users && (
                <div className="flex items-center -space-x-1">
                  {project?.users && project.users.length > 0 ? (
                    project.users
                      .filter((user) => ["INFRA", "DEVELOPPER"].includes(user.role.toUpperCase()))
                      .map((user, index) => (
                        <div
                          key={user.id}
                          className="relative w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 overflow-hidden cursor-pointer"
                          style={{ zIndex: project.users.length - index }}
                        >
                          {user.photo ? (
                            <Image
                              src={
                                process.env.NEXT_PUBLIC_BACKEND_URL
                                  ? new URL(user.photo, process.env.NEXT_PUBLIC_BACKEND_URL).toString()
                                  : user.photo
                              }
                              alt={`${user.firstName} ${user.lastName}`}
                              width={16}
                              height={16}
                              className="object-cover w-full h-full"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/images/user/user1.jpg";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                              <FiUser className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                            </div>
                          )}
                        </div>
                      ))
                  ) : (
                    <p className="text-gray-500 text-2xs">Aucun utilisateur assigné.</p>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-8 gap-1 p-1 h-36">
            {Object.entries(tasks).map(([status, taskList]) => (
              <div key={status} className={`bg-gray-100 dark:bg-gray-700 p-1 rounded col-span-2 ${status === "Done" ? "col-span-1" : ""}`}>
                <h4 className="font-medium text-xs text-black dark:text-white">{status}</h4>
                <ul className="text-xs space-y-0.5 h-20 overflow-y-auto">
                  {taskList.slice(0, 3).map((task) => (
                    <li key={task.id} className="truncate">{task.title}</li>
                  ))}
                  {taskList.length > 3 && <li className="text-gray-500">+{taskList.length - 3} more</li>}
                </ul>
              </div>
            ))}
            <div className="col-span-2 p-1">
              <div className="w-full p-1 bg-white dark:bg-gray-800 shadow-md rounded-lg border dark:border-gray-700">
                <h3 className="text-xs font-semibold mb-1 text-gray-900 dark:text-white">
                  Analyses du Sprint
                </h3>

                <div className="space-y-1">
                  <div>
                    <div className="flex justify-between text-xs text-gray-700 dark:text-gray-300">
                      <span>Terminé</span>
                      <span>{donePercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-300 dark:bg-gray-700 h-1 rounded-lg overflow-hidden">
                      <div
                        className="bg-blue-600 dark:bg-blue-400 h-full rounded-lg transition-all duration-1000"
                        style={{ width: animate ? `${donePercentage}%` : "0%" }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-700 dark:text-gray-300">
                      <span>En cours</span>
                      <span>{inProgressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-300 dark:bg-gray-700 h-1 rounded-lg overflow-hidden">
                      <div
                        className="bg-red-500 dark:bg-red-400 h-full rounded-lg transition-all duration-1000"
                        style={{ width: animate ? `${inProgressPercentage}%` : "0%" }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-700 dark:text-gray-300">
                      <span>À faire</span>
                      <span>{toDoPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-300 dark:bg-gray-700 h-1 rounded-lg overflow-hidden">
                      <div
                        className="bg-gray-500 dark:bg-gray-400 h-full rounded-lg transition-all duration-1000"
                        style={{ width: animate ? `${toDoPercentage}%` : "0%" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default MiniSprintCard;
