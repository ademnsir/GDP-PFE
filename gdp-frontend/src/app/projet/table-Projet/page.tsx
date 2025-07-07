"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import TableProjet from "@/components/Gestion-projets/tableProjets/TableProjet";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import AdminRoute from "@/components/AdminRoute";

const TablesProjet = () => {
  return (
    <AdminRoute>
      <DefaultLayout>
        <Breadcrumb pageName="Liste des projets" />

        <div className="flex flex-col gap-10">
          <TableProjet />
        </div>
      </DefaultLayout>
    </AdminRoute>
  );
};

export default TablesProjet;
