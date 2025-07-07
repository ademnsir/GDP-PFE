import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  color?: "success" | "warning" | "error" | "default";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  color = "default",
  size = "md",
  className = "",
}) => {
  const colorClasses = {
    success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    default: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-sm",
    lg: "px-3 py-1 text-base",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${colorClasses[color]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge; 