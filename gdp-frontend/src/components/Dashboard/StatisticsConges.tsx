"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { MoreDotIcon } from "@/icons";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { useState } from "react";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { useRouter } from "next/navigation";
import { DashboardStats } from "@/services/dashboardService";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface StatisticsCongesProps {
  stats?: DashboardStats;
  onMonthClick?: (month: string) => void;
}

const monthMapping: { [key: string]: string } = {
  "Janv": "Jan",
  "Févr": "Feb",
  "Mars": "Mar",
  "Avr": "Apr",
  "Mai": "May",
  "Juin": "Jun",
  "Juil": "Jul",
  "Août": "Aug",
  "Sept": "Sep",
  "Oct": "Oct",
  "Nov": "Nov",
  "Déc": "Dec"
};

export default function StatisticsConges({ stats, onMonthClick }: StatisticsCongesProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleMonthClick = (month: string) => {
    if (onMonthClick) {
      onMonthClick(monthMapping[month] || month);
    }
  };

  const options: ApexOptions = {
    colors: ["#1e40af"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 280,
      toolbar: {
        show: false,
      },
      events: {
        dataPointSelection: function(event, chartContext, config) {
          if (config && config.dataPointIndex !== undefined) {
            const month = config.w.config.xaxis.categories[config.dataPointIndex];
            handleMonthClick(month);
          }
        }
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: [
        "Janv",
        "Févr",
        "Mars",
        "Avr",
        "Mai",
        "Juin",
        "Juil",
        "Août",
        "Sept",
        "Oct",
        "Nov",
        "Déc",
      ],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: {
      title: {
        text: "Nombre de congés",
        style: {
          fontSize: '12px',
          fontWeight: 500,
          fontFamily: 'Outfit, sans-serif',
        },
        offsetX: -10,
        offsetY: 0,
      },
      min: 0,
      max: 10,
      tickAmount: 6,
      labels: {
        formatter: function(val) {
          return Math.round(val).toString();
        },
        style: {
          fontSize: '12px',
          fontFamily: 'Outfit, sans-serif',
        },
        offsetX: 16,
      }
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
      padding: {
        left: 20,
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      x: {
        show: false,
      },
      y: {
        formatter: (val: number) => `${val} congés`,
      },
    },
  };

  const series = [
    {
      name: "Congés",
      data: stats?.conges?.byMonth || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
  ];

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Statistiques des Congés
        </h3>

      
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={280}
          />
        </div>
      </div>
    </div>
  );
} 