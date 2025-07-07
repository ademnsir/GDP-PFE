"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { requestPasswordReset, resetPassword } from "@/services/user";
import Image from "next/image";
import { EyeIcon, EyeOffIcon, Loader2, ArrowLeft, Mail, Lock, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");
  const [step, setStep] = useState<"request" | "reset" | "success">("request");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      setStep("reset");
    }
  }, [searchParams]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await requestPasswordReset(email);
      setSuccess("Un email de réinitialisation a été envoyé à votre adresse email.");
      setStep("success");
    } catch (err: any) {
      setError(err.response?.data?.message || "Une erreur est survenue lors de l'envoi de l'email.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(token, newPassword);
      setSuccess("Votre mot de passe a été réinitialisé avec succès !");
      setStep("success");
    } catch (err: any) {
      setError(err.response?.data?.message || "Une erreur est survenue lors de la réinitialisation.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderRequestForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Mail className="w-8 h-8 text-blue-600" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Mot de passe oublié ?
        </h2>
        <p className="text-gray-600">
          Entrez votre adresse email pour recevoir un lien de réinitialisation
        </p>
      </div>

      <form onSubmit={handleRequestReset} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adresse email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            placeholder="Entrez votre email"
          />
        </div>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Envoi en cours...</span>
            </>
          ) : (
            <>
              <Mail className="w-5 h-5" />
              <span>Envoyer le lien</span>
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );

  const renderResetForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Lock className="w-8 h-8 text-green-600" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Nouveau mot de passe
        </h2>
        <p className="text-gray-600">
          Entrez votre nouveau mot de passe
        </p>
      </div>

      <form onSubmit={handleResetPassword} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nouveau mot de passe
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Entrez votre nouveau mot de passe"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <EyeOffIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirmer le mot de passe
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Confirmez votre nouveau mot de passe"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? (
                <EyeOffIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-200 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Réinitialisation...</span>
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              <span>Réinitialiser le mot de passe</span>
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );

  const renderSuccess = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md mx-auto text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
      >
        <CheckCircle className="w-8 h-8 text-green-600" />
      </motion.div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        {step === "success" && token ? "Mot de passe réinitialisé !" : "Email envoyé !"}
      </h2>
      <p className="text-gray-600 mb-6">
        {step === "success" && token 
          ? "Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe."
          : "Un email de réinitialisation a été envoyé à votre adresse email. Veuillez vérifier votre boîte de réception et suivre les instructions."
        }
      </p>
      <Link
        href="/signin"
        className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Retour à la connexion</span>
      </Link>
    </motion.div>
  );

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
        className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 relative z-10"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-6"
        >
          <Image
            src="/images/logo/logo.png"
            alt="Wifak Bank Logo"
            width={150}
            height={45}
            priority={true}
          />
        </motion.div>

        {/* Error Message */}
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

        {/* Content */}
        {step === "request" && renderRequestForm()}
        {step === "reset" && renderResetForm()}
        {step === "success" && renderSuccess()}
      </motion.div>
    </div>
  );
} 