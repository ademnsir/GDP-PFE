import GestionConges from "@/components/Gestion-conges/page";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Wifak Bank",
 
};

const GestionCongesPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DefaultLayout>
        <GestionConges />
      </DefaultLayout>
    </Suspense>
  );
};

export default GestionCongesPage;
