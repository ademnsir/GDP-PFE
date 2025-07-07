import ProjectAlerts from "@/components/Gestion-problemes/page";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Wifak Bank",
};

const ProjectAlertsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DefaultLayout>
        <ProjectAlerts />
      </DefaultLayout>
    </Suspense>
  );
};

export default ProjectAlertsPage;
