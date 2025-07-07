"use client";

import CreateUser from "@/components/Gestion-users/formulaire-ajout/page";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import AdminRoute from "@/components/AdminRoute";

const CreateUserPage = () => {
  return (
    <AdminRoute>
      <DefaultLayout>
        <CreateUser />
      </DefaultLayout>
    </AdminRoute>
  );
};

export default CreateUserPage;
