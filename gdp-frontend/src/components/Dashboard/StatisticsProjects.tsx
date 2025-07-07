"use client";
import React from 'react';
import { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
import { DashboardStats } from '@/services/dashboardService';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface StatisticsChartProps {
  stats: DashboardStats | null;
  onStatusClick: (status: string) => void;
  selectedStatus?: string;
}

export default function StatisticsChart({ stats, onStatusClick, selectedStatus }: StatisticsChartProps) {
  const options: ApexOptions = {
    colors: ["#22c55e", "#3b82f6", "#eab308"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 300,
      type: "donut",
      toolbar: {
        show: false,
      },
      background: 'transparent',
      animations: {
        enabled: true,
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      },
      events: {
        dataPointSelection: function(event, chartContext, config) {
          const status = config.w.config.labels[config.dataPointIndex];
          onStatusClick(status);
        }
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          background: 'transparent',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '15px',
              fontFamily: 'Outfit, sans-serif',
              color: '#4B5563',
              fontWeight: 500
            },
            value: {
              show: true,
              fontSize: '24px',
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 600,
              color: '#FFFFFF',
              formatter: function (val: string) {
                return Math.round(Number(val)) + '%';
              }
            },
            total: {
              show: true,
              label: 'Total',
              fontSize: '14px',
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 500,
              color: '#FFFFFF',
              formatter: function (w: any) {
                return Math.round(w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0)) + '%';
              }
            }
          }
        },
        dataLabels: {
          // color: '#FFFFFF'
        }
      }
    },
    labels: ['Complété', 'En cours', 'À faire'],
    dataLabels: {
      enabled: true,
      formatter: function (val: string) {
        return Math.round(Number(val)) + '%';
      },
      style: {
        fontSize: '13px',
        fontFamily: 'Outfit, sans-serif',
        fontWeight: 600,
        colors: ['#FFFFFF', '#FFFFFF', '#FFFFFF'] as string[]
      },
      background: {
        enabled: false
      },
      dropShadow: {
        enabled: true,
        opacity: 0.3,
        blur: 4,
        left: 0,
        top: 0
      }
    },
    legend: {
      show: true,
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '13px',
      fontFamily: 'Outfit, sans-serif',
      fontWeight: 500,
      markers: {
        size: 6,
        strokeWidth: 0,
        fillColors: ["#22c55e", "#3b82f6", "#eab308"]
      },
      itemMargin: {
        horizontal: 12,
        vertical: 6
      },
      onItemClick: {
        toggleDataSeries: true
      }
    },
    tooltip: {
      enabled: true,
      theme: 'dark',
      style: {
        fontSize: '13px',
        fontFamily: 'Outfit, sans-serif',
      },
      y: {
        formatter: function (val: number) {
          return Math.round(val) + '%';
        }
      },
      marker: {
        show: true
      },
      custom: function({ series, seriesIndex, dataPointIndex, w }: any) {
        const colors = ["#22c55e", "#3b82f6", "#eab308"];
        return `<div class="p-2 bg-gray-900 text-white rounded-lg shadow-lg border border-gray-700">
                  <div class="font-medium flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full" style="background-color: ${colors[seriesIndex]}"></span>
                    ${w.globals.labels[seriesIndex]}
                  </div>
                  <div class="text-sm text-white mt-1">${Math.round(series[seriesIndex])}%</div>
                </div>`;
      }
    },
    states: {
      hover: {
        filter: {
          type: 'lighten'
        }
      },
      active: {
        filter: {
          type: 'darken'
        }
      }
    },
    stroke: {
      width: 0,
      lineCap: 'round'
    }
  };

  const series = [
    stats?.projects?.productivity?.completionRate || 0,
    stats?.projects?.productivity?.inProgressRate || 0,
    stats?.projects?.productivity?.toDoRate || 0,
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6 h-[380px] relative group shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex flex-col gap-4 mb-5 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Statistiques de Productivité des Projets
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Taux de complétion des projets par statut
          </p>
        </div>
      </div>

      <div className="h-[280px]">
        <ReactApexChart
          options={options}
          series={series}
          type="donut"
          height={280}
        />
      </div>

      {selectedStatus && (
        <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full animate-pulse">
          <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
        </div>
      )}
    </div>
  );
} 