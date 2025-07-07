import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wifak Bank - Dashboard",
  description: "Tableau de bord Wifak Bank",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 