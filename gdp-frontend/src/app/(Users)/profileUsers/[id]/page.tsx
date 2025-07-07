"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchUserById, fetchCongesByMatricule, User, Conge, CongeStatus } from "@/services/user";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import ProjetList from "@/components/Gestion-users/profile/ProjectList";
import ProfileInfo from "@/components/Gestion-users/profile/ProfileInfo";
import ProfilePhoto from "@/components/Gestion-users/profile/ProfilePhoto";
import { getUserData } from "@/services/authService";


const ProfileUser = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string | undefined; // Access the id from params

  const [formData, setFormData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conges, setConges] = useState<Conge[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const userData = getUserData();
    setUserRole(userData?.role || null);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) {
        setError("ID utilisateur non valide.");
        setLoading(false);
        return;
      }

      try {
        const user = await fetchUserById(id);
        setFormData({
          id: user.id,
          username: user.username ?? "",
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          bio: user.bio ?? "",
          photo: user.photo ?? "",
          status: user.status,
          hireDate: user.hireDate,
          endDate: user.endDate,
          matricule: user.matricule,
          projects: user.projects ?? [],
        });

        if (user.matricule) {
          const userConges = await fetchCongesByMatricule(user.matricule);
          setConges(userConges);
        }
      } catch (err) {
        setError("Erreur lors du chargement des données utilisateur.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleStatusUpdate = (status: CongeStatus) => {
    setConges((prevConges) =>
      prevConges.map((conge) =>
        conge.status === CongeStatus.PENDING ? { ...conge, status } : conge
      )
    );
  };

  const handleUserStatusUpdate = () => {
    // Navigate back to the user list to trigger a re-fetch
    router.push("/list-Users"); 
    console.log("User status potentially updated, navigating back to list...");
  };

  const handlePhotoUpdate = (newPhotoPath: string) => {
    if (formData) {
      setFormData({
        ...formData,
        photo: newPhotoPath
      });
    }
  };

  if (loading) return <DefaultLayout><p>Chargement...</p></DefaultLayout>;
  if (error) return <DefaultLayout><p className="text-red-500">{error}</p></DefaultLayout>;

  return (
    <DefaultLayout>
      <Breadcrumb pageName={`Profil de ${formData?.firstName ?? "Utilisateur"}`} />
      <div className="grid grid-cols-5 gap-8">
        <div className="col-span-3">
          {formData && <ProfileInfo formData={formData} setFormData={setFormData} />}
        </div>
        <div className="col-span-2 space-y-6">
          {formData && (
            <ProfilePhoto 
              photo={formData?.photo} 
              firstName={formData?.firstName} 
              lastName={formData?.lastName}
              userId={formData?.id}
              onPhotoUpdate={handlePhotoUpdate}
            />
          )}
        </div>
      </div>
      {formData?.projects && userRole === 'ADMIN' && <ProjetList projects={formData.projects} />}
    </DefaultLayout>
  );
};

export default ProfileUser;
