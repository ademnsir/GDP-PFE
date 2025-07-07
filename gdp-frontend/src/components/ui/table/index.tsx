import React from "react";

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className = "" }) => {
  return (
    <div className={`w-full ${className}`}>
      <table className="w-full">{children}</table>
    </div>
  );
};

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  children,
  className = "",
}) => {
  return <thead className={className}>{children}</thead>;
};

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const TableBody: React.FC<TableBodyProps> = ({
  children,
  className = "",
}) => {
  return <tbody className={className}>{children}</tbody>;
};

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
}

export const TableRow: React.FC<TableRowProps> = ({
  children,
  className = "",
}) => {
  return <tr className={className}>{children}</tr>;
};

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  isHeader?: boolean;
}

export const TableCell: React.FC<TableCellProps> = ({
  children,
  className = "",
  isHeader = false,
}) => {
  const Component = isHeader ? "th" : "td";
  return (
    <Component
      className={`whitespace-nowrap ${className}`}
    >
      {children}
    </Component>
  );
}; 