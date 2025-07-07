import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { getToken, getUserRole, getUserData } from "@/services/authService"; 

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: string | null;
  setUserRole: (role: string | null) => void;
  firstName: string | null;
  lastName: string | null;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userRole: null,
  setUserRole: () => {},
  firstName: null,
  lastName: null, 
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null); 
  const [lastName, setLastName] = useState<string | null>(null); 
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    // Pages publiques qui ne nécessitent pas d'authentification
    const publicPaths = ['/signin', '/SignIn', '/ResetPassword', '/reset-password', '/reset-password-token'];
    
    console.log('AuthContext - Current pathname:', pathname);
    console.log('AuthContext - Is public path:', publicPaths.includes(pathname));
    
    // Ne pas traiter le token de réinitialisation comme un token d'authentification
    const isResetPasswordPage = pathname === '/reset-password-token';
    const token = isResetPasswordPage ? null : (searchParams.get('token') || getToken());
    console.log('AuthContext - Token found:', !!token);
    console.log('AuthContext - Is reset password page:', isResetPasswordPage);
    
    // Si nous sommes sur une page publique, ne pas rediriger
    if (publicPaths.includes(pathname)) {
      console.log('AuthContext - On public path, not redirecting');
      if (token && !isResetPasswordPage) {
        // Si l'utilisateur est authentifié sur une page publique, le rediriger vers le dashboard
        console.log('AuthContext - User authenticated on public path, redirecting to dashboard');
        setIsAuthenticated(true);
        const role = getUserRole();
        setUserRole(role);
        const userInfo = getUserData(); 
        if (userInfo) {
          setFirstName(userInfo.firstName);
          setLastName(userInfo.lastName);
        }
        router.push('/Dashboard');
      }
      return;
    }

    // Pour les autres pages, vérifier l'authentification
    console.log('AuthContext - On protected path, checking authentication');
    if (!token) {
      console.log('AuthContext - No token, redirecting to signin');
      router.push("/signin");
    } else {
      console.log('AuthContext - Token found, setting authenticated');
      if (searchParams.get('token')) {
        localStorage.setItem('token', token);
      }
      setIsAuthenticated(true);
      
      const role = getUserRole();
      setUserRole(role);

      const userInfo = getUserData(); 
      if (userInfo) {
        setFirstName(userInfo.firstName);
        setLastName(userInfo.lastName);
      }
    }
  }, [router, searchParams, pathname]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, setUserRole, firstName, lastName }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
