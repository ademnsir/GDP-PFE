import CreateStagiere from "@/components/Gestion-stagiere/formulaire-ajout/page";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const metadata: Metadata = {
  title: "wifakbank",
  description:
    "wifakbank",
};

const CreateStagierePage = () => {
  return (
    <DefaultLayout>
      <CreateStagiere />
    </DefaultLayout>
  );
};

export default CreateStagierePage;
