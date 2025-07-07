"use client";

import AdminRoute from "@/components/AdminRoute";
import FormAjoutProjet from "@/components/Gestion-projets/formulaire-ajout/page";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

const FormAjoutProjetPage = () => {
  return (
    <DefaultLayout>
    <AdminRoute>
      <FormAjoutProjet />
    </AdminRoute>
 </DefaultLayout>
  );
};

export default FormAjoutProjetPage;
