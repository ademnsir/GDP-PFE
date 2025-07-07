"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import TableUsers from "@/components/Gestion-users/tableUsers/TableUser";
import AdminRoute from "@/components/AdminRoute";

const TablesPage = () => {
  return (
    <AdminRoute>
      <DefaultLayout>
        <Breadcrumb pageName="Liste des profils utilisateurs" />
        <div className="flex flex-col gap-10">
          <TableUsers /> 
        </div>
      </DefaultLayout>
    </AdminRoute>
  );
};

export default TablesPage;
