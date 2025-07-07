"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginUser, getUserRole, loginWithGoogle, isAuthenticated } from "@/services/authService";
import Image from "next/image";
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function SignIn() {
  const [matricule, setMatricule] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà authentifié
    if (isAuthenticated()) {
      console.log('User is already authenticated, redirecting to Dashboard');
      router.replace('/Dashboard');
      return;
    }

    const token = searchParams.get('token');
    const error = searchParams.get('error');
    
    if (token) {
      console.log('Token found in URL, setting in localStorage');
      localStorage.setItem('token', token);
      router.replace('/Dashboard');
    }
    
    if (error === 'google_auth_failed') {
      setError('Erreur lors de la connexion avec Google');
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log('Tentative de connexion...');
      if (!matricule || !password) {
        throw new Error('Veuillez remplir tous les champs');
      }

      await loginUser(matricule, password);
      console.log('Connexion réussie, redirection vers le dashboard...');
      const role = getUserRole();
      router.replace("/Dashboard");
    } catch (err: any) {
      console.error('Erreur lors de la connexion:', err);
      setError(err.message || "Une erreur est survenue lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      // Rediriger vers la page de connexion Google
      window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google`;
    } catch (err) {
      setError("Erreur lors de la connexion avec Google.");
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(90deg, #004aad 0%, #bc244b 100%)"
      }}
    >
      {/* Animated background elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 overflow-hidden"
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-blue-100/20 to-purple-100/20 rounded-full"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-r from-purple-100/20 to-blue-100/20 rounded-full"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden relative z-10"
      >
        <div className="flex flex-col md:flex-row h-full">
          {/* Left side - Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-col items-center mb-8"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Image
                  src="/images/logo/logo.png"
                  alt="Wifak Bank Logo"
                  width={200}
                  height={60}
                  priority={true}
                  className="mb-4"
                />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-800">
                Bienvenue sur Wifak Bank
              </h2>
              <p className="text-gray-600 mt-2">Connectez-vous à votre compte</p>
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <p className="text-red-600 text-sm text-center">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Matricule
                </label>
                <motion.div
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <input
                    type="text"
                    value={matricule}
                    onChange={(e) => setMatricule(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Entrez votre matricule"
                  />
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <motion.div
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Entrez votre mot de passe"
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </motion.button>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="mt-2 text-right"
                >
                  <button
                    type="button"
                    onClick={() => {
                      // Navigation directe sans passer par la page principale
                      window.location.href = '/ResetPassword';
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
                  >
                    Mot de passe oublié ?
                  </button>
                </motion.div>
              </motion.div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 relative overflow-hidden ${
                  isLoading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-[#004aad] hover:bg-blue-700"
                }`}
              >
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: isHovered ? "100%" : "-100%" }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 mx-auto"
                  >
                    <Loader2 className="w-full h-full text-white" />
                  </motion.div>
                ) : (
                  "Se connecter"
                )}
              </motion.button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-gray-300 w-full"></div>
                <span className="px-4 text-gray-500 text-sm">ou</span>
                <div className="border-t border-gray-300 w-full"></div>
              </div>

              <motion.button
                type="button"
                onClick={handleGoogleLogin}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-lg text-gray-700 font-medium transition-all duration-200 bg-white border border-gray-300 hover:bg-gray-50 flex items-center justify-center space-x-2"
              >
                <Image
                  src="/images/icon/google.png"
                  alt="Google Logo"
                  width={20}
                  height={20}
                />
                <span>Continuer avec Google</span>
              </motion.button>
            </form>
          </motion.div>

          {/* Right side - Image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="hidden md:block w-1/2 relative overflow-hidden"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <Image
                src="/images/logo/wif.jpg"
                alt="Wifak Bank Building"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: "cover" }}
                className="rounded-r-2xl"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="absolute bottom-8 left-8 right-8 bg-black/60 backdrop-blur-sm p-6 rounded-xl text-white"
            >
              <h3 className="text-xl font-semibold mb-2">
                Solutions financières innovantes
              </h3>
              <p className="text-sm leading-relaxed">
                Avec Wifak Bank, transformez vos ambitions en succès grâce à des
                solutions financières innovantes et adaptées à vos besoins.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
