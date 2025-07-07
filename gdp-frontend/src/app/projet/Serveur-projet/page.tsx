import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import ProjetServeur from "@/components/Gestion-projets/DetailsPage/ProjectServerView";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";


export const metadata: Metadata = {
  title: "Wifak Bank",
  description:
    "wifak bank",
};

const TablesProjet = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Projets et Serveurs" />

      <div className="flex mt-15 flex-col gap-10">
        <ProjetServeur />
      </div>
    </DefaultLayout>
  );
};

export default TablesProjet;
