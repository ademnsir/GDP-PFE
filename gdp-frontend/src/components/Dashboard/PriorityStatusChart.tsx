"use client";

import React from 'react';
import { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
import { DashboardStats } from '@/services/dashboardService';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface PriorityStatusChartProps {
  stats: DashboardStats | null;
}

export default function PriorityStatusChart({ stats }: PriorityStatusChartProps) {
  console.log('Received stats:', stats); // Debug log
  console.log('Project priorities:', stats?.projects?.byPriority); // Debug log

  const options: ApexOptions = {
    chart: {
      type: 'bar',
      height: 350,
      stacked: true,
      toolbar: {
        show: false,
      },
      background: 'transparent',
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 4,
        dataLabels: {
          position: 'top',
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: ['Projets', 'Tâches'],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: '12px',
          fontFamily: 'Outfit, sans-serif',
        },
      },
    },
    yaxis: {
      title: {
        text: 'Nombre',
        style: {
          fontSize: '12px',
          fontFamily: 'Outfit, sans-serif',
          color: '#6B7280',
        },
      },
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: '12px',
          fontFamily: 'Outfit, sans-serif',
        },
      },
    },
    fill: {
      opacity: 1,
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: "vertical",
        shadeIntensity: 0.25,
        gradientToColors: undefined,
        inverseColors: true,
        opacityFrom: 0.85,
        opacityTo: 0.85,
        stops: [0, 100]
      },
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + ' éléments';
        },
      },
      theme: 'light',
      style: {
        fontSize: '12px',
        fontFamily: 'Outfit, sans-serif',
      },
    },
    colors: ['#465FFF', '#9CB9FF', '#FF6B6B', '#4CAF50', '#FFD700', '#50548c'],
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      offsetX: 40,
      fontSize: '12px',
      fontFamily: 'Outfit, sans-serif',
      markers: {
        size: 12,
        strokeWidth: 0,
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5
      }
    },
    grid: {
      borderColor: '#f1f1f1',
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      },
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      },
    },
  };

  const series = [
    {
      name: 'Haute priorité',
      data: [
        stats?.projects?.byPriority?.['Haute'] || 0,
        stats?.tasks?.byPriority?.['high'] || 0,
      ],
    },
    {
      name: 'Moyenne priorité',
      data: [
        stats?.projects?.byPriority?.['Moyenne'] || 0,
        stats?.tasks?.byPriority?.['medium'] || 0,
      ],
    },
    {
      name: 'Basse priorité',
      data: [
        stats?.projects?.byPriority?.['Faible'] || 0,
        stats?.tasks?.byPriority?.['low'] || 0,
      ],
    },
    {
      name: 'Complété',
      data: [
        stats?.projects?.byStatus?.['Fini'] || 0,
        0,
      ],
    },
    {
      name: 'En cours',
      data: [
        stats?.projects?.byStatus?.['En cours'] || 0,
        0,
      ],
    },
    {
      name: 'À faire',
      data: [
        stats?.projects?.byStatus?.['A faire'] || 0,
        0,
      ],
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Statistiques par Priorité et Statut
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Vue d&apos;ensemble des projets et tâches
          </p>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={350}
          />
        </div>
      </div>
    </div>
  );
} 