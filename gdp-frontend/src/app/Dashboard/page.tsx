"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getUserData, isAuthenticated, getUserRole } from "@/services/authService";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import StatisticsChart from "@/components/Dashboard/StatisticsProjects";
import StatisticsConges from "@/components/Dashboard/StatisticsConges";
import CongestatView from "@/components/Dashboard/congestatView";
import RecentOrders from "@/components/Dashboard/projetstatView";
import PriorityStatusChart from "@/components/Dashboard/PriorityStatusChart";
import { fetchDashboardStats, DashboardStats } from "@/services/dashboardService";
import { UserIcon } from '@heroicons/react/24/outline';
import { BriefcaseIcon } from '@heroicons/react/24/outline';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

function DashboardStatCard({ icon, title, value, color }: { icon: React.ReactNode, title: string, value: number | string, color: string }) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800 px-5 py-4 shadow-sm">
      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${color} bg-opacity-10`}>{icon}</div>
      <div>
        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">{title}</div>
        <div className="text-xl font-bold text-gray-800 dark:text-white">{value}</div>
      </div>
    </div>
  );
}

const Dashboard = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    console.log('Dashboard - Token from URL:', token);
    
    if (token) {
      console.log('Setting token in localStorage');
      localStorage.setItem('token', token);
    }

    // Vérifier l'authentification et le rôle
    const isUserAuthenticated = isAuthenticated();
    const userRole = getUserRole();
    
    if (!isUserAuthenticated) {
      console.log('User not authenticated, redirecting to SignIn');
      router.replace('/signin');
      return;
    }

    // Rediriger les non-admins vers /mes-sprints
    if (userRole !== "ADMIN") {
      console.log('User is not admin, redirecting to /mes-sprints');
      router.replace('/mes-sprints');
      return;
    }

    const loadStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }
        const data = await fetchDashboardStats(token);
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [searchParams, router]);

  const handleStatusClick = (status: string) => {
    setSelectedStatus(status);
  };

  const handleMonthClick = (month: string) => {
    setSelectedMonth(month);
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </DefaultLayout>
    );
  }

  if (error) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-red-500 text-xl">{error}</div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <DashboardStatCard
          icon={<UserIcon className="w-6 h-6 text-blue-600" />}
          title="Utilisateurs"
          value={stats?.users?.total ?? 0}
          color="text-blue-600"
        />
        <DashboardStatCard
          icon={<BriefcaseIcon className="w-6 h-6 text-green-600" />}
          title="Projets"
          value={stats?.projects?.total ?? 0}
          color="text-green-600"
        />
        <DashboardStatCard
          icon={<CalendarDaysIcon className="w-6 h-6 text-yellow-500" />}
          title="Congés"
          value={stats?.conges?.total ?? 0}
          color="text-yellow-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-8 2xl:gap-8">
        <StatisticsChart stats={stats} onStatusClick={handleStatusClick} />
        <RecentOrders selectedStatus={selectedStatus} stats={stats} />
      </div>

      <div className="mt-6">
        <PriorityStatusChart stats={stats} />
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-8 2xl:gap-8 mt-8">
        <StatisticsConges stats={stats || undefined} onMonthClick={handleMonthClick} />
        <CongestatView selectedMonth={selectedMonth} />
      </div>
    </DefaultLayout>
  );
};

export default Dashboard;
