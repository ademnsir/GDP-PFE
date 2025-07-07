"use client";

import Stagiere from "@/components/Gestion-stagiere/page";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import AdminRoute from "@/components/AdminRoute";

const StagierePage = () => {
  return (
    <AdminRoute>
      <DefaultLayout>
        <Stagiere />
      </DefaultLayout>
    </AdminRoute>
  );
};

export default StagierePage;
