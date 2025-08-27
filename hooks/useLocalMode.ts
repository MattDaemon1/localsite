"use client";
import { useEffect, useState } from "react";

export const useLocalMode = () => {
  const [isLocalMode, setIsLocalMode] = useState(false);

  useEffect(() => {
    // Vérifier si le mode local est activé
    setIsLocalMode(process.env.NEXT_PUBLIC_LOCAL_MODE === "true");
  }, []);

  return isLocalMode;
};