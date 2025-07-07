import TaskPage from "@/components/Gestion-tache-projet/page";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const metadata: Metadata = {
  title: "Wifak Bank",
 
};

const TaskPageP = () => {
  return (
    <DefaultLayout>
      <TaskPage />
    </DefaultLayout>
  );
};

export default TaskPageP;
