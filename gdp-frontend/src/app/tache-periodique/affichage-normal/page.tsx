"use client";

import AdminRoute from "@/components/AdminRoute";
import AffichageNormal from "@/components/Gestion-tache-periodique/affichage-normal";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

const AffichageNormalPage = () => {
  return (
    <AdminRoute>
      <DefaultLayout>
        <AffichageNormal />
      </DefaultLayout>
    </AdminRoute>
  );
};

export default AffichageNormalPage;
