import React from "react";

interface DropdownItemProps {
  children: React.ReactNode;
  onItemClick?: () => void;
  className?: string;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  children,
  onItemClick,
  className = "",
}) => {
  return (
    <button
      onClick={onItemClick}
      className={`block w-full px-4 py-2 text-sm ${className}`}
    >
      {children}
    </button>
  );
}; 