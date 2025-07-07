"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

const NotFoundPage = () => {
  const [isRed, setIsRed] = useState(false);
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const isPermissionError = errorParam === "403";

  useEffect(() => {
    const interval = setInterval(() => {
      setIsRed((prev) => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Fond animé avec gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2560a0] via-[#1a4674] to-[#d01e3e] opacity-10" />
      
      {/* Particules animées */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full"
            initial={{
              x: Math.random() * 100 + "%",
              y: Math.random() * 100 + "%",
              opacity: 0.2,
            }}
            animate={{
              x: [
                Math.random() * 100 + "%",
                Math.random() * 100 + "%",
                Math.random() * 100 + "%",
              ],
              y: [
                Math.random() * 100 + "%",
                Math.random() * 100 + "%",
                Math.random() * 100 + "%",
              ],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center justify-center min-h-screen p-4 gap-8">
        {/* Logo 3D animé */}
        <motion.div
          initial={{ rotateY: 0 }}
          animate={{
            rotateY: 360,
            scale: [1, 1.1, 1],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            perspective: "1000px",
            transformStyle: "preserve-3d",
          }}
          className="relative"
        >
          <div className="relative w-40 h-40">
            <Image
              src="/images/logo/logo.png"
              alt="Logo Wifak Bank"
              layout="fill"
              objectFit="contain"
              className={`transition-all duration-300 ${
                isRed ? "drop-shadow-[0_0_15px_rgba(208,30,62,0.6)]" : "drop-shadow-[0_0_15px_rgba(37,96,160,0.6)]"
              }`}
            />
          </div>
        </motion.div>

        {/* Code d&apos;erreur animé */}
        <motion.h1
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          className="text-8xl font-bold bg-gradient-to-r from-[#2560a0] to-[#d01e3e] text-transparent bg-clip-text"
        >
          {isPermissionError ? "403" : "404"}
        </motion.h1>

        {/* Message d&apos;erreur */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-gray-700 text-center max-w-md"
        >
          {isPermissionError
            ? "Vous n&apos;avez pas la permission d&apos;accéder à cette page."
            : "La page que vous recherchez n&apos;existe pas ou a été déplacée."}
        </motion.p>

        {/* Bouton de retour animé */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            href="/"
            className="relative inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-[#2560a0] to-[#d01e3e] rounded-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-[#2560a0]/20"
          >
            <span className="relative z-10">Retourner à l&apos;accueil</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[#d01e3e] to-[#2560a0]"
              initial={{ x: "100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
          </Link>
        </motion.div>

        {/* Cercles décoratifs */}
        <motion.div
          className="absolute w-96 h-96 rounded-full border-2 border-[#2560a0]/20"
          style={{ filter: "blur(1px)" }}
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute w-72 h-72 rounded-full border-2 border-[#d01e3e]/20"
          style={{ filter: "blur(1px)" }}
          animate={{
            rotate: -360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
    </div>
  );
};

export default NotFoundPage;
