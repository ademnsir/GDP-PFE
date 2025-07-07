"use client";

import AdminRoute from "@/components/AdminRoute";
import TachePeriodique from "@/components/Gestion-tache-periodique/page";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

const TachePeriodiquePage = () => {
  return (
    <AdminRoute>
      <DefaultLayout>
        <TachePeriodique />
      </DefaultLayout>
    </AdminRoute>
  );
};

export default TachePeriodiquePage;
