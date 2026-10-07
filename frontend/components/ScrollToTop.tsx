"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Composant qui fait défiler la page vers le haut lors du changement de route
 */
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Défiler vers le haut instantanément lors du changement de page
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
