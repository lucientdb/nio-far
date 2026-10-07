import { useEffect, useRef } from "react";

/**
 * Hook pour détecter les clics en dehors d'un élément
 * @param callback - Fonction à exécuter lors d'un clic en dehors
 * @returns ref - Référence à attacher à l'élément
 */
export function useClickOutside<T extends HTMLElement = HTMLDivElement>(
  callback: () => void
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    // Attacher l'événement après un petit délai pour éviter la fermeture immédiate
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [callback]);

  return ref;
}
