"use client";

import { useEffect } from "react";

export function usePublicStoreLightMode() {
  useEffect(() => {
    const root = document.documentElement;
    const hadDarkClass = root.classList.contains("dark");

    root.classList.remove("dark");

    return () => {
      if (hadDarkClass) {
        root.classList.add("dark");
      }
    };
  }, []);
}
