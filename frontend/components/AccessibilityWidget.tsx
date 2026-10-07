"use client";
import { useState, useEffect, useCallback } from "react";
import { Accessibility, ZoomIn, ZoomOut, Sun, Type, X } from "lucide-react";
import { useClickOutside } from "@/hooks/useClickOutside";

type A11ySettings = {
  fontSize: "normal" | "large" | "xlarge";
  highContrast: boolean;
  letterSpacing: boolean;
};

const defaults: A11ySettings = {
  fontSize: "normal",
  highContrast: false,
  letterSpacing: false,
};

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<A11ySettings>(defaults);
  const [showTooltip, setShowTooltip] = useState(false);
  const [typedChars, setTypedChars] = useState(0);

  const textChars = "Personnalise l'affichage".split("");
  
  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);
  
  const widgetRef = useClickOutside<HTMLDivElement>(handleClose);

  useEffect(() => {
    // Fait apparaître le tooltip après 1 seconde
    const timer = setTimeout(() => setShowTooltip(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showTooltip && !open) {
      let count = 0;
      let interval: NodeJS.Timeout;
      let timeout: NodeJS.Timeout;

      const runLoop = () => {
        count = 0;
        setTypedChars(0);
        
        interval = setInterval(() => {
          count++;
          setTypedChars(count);
          // Attendre un peu après avoir fini d'écrire
          if (count >= textChars.length + 20) {
            clearInterval(interval);
            // Recommencer après 1 seconde
            timeout = setTimeout(runLoop, 1000);
          }
        }, 60);
      };

      runLoop();
      
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [showTooltip, open, textChars.length]);

  useEffect(() => {
    const root = document.documentElement;

    // Taille de police
    root.setAttribute("data-fontsize", settings.fontSize);

    // Contraste élevé
    if (settings.highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }

    // Espacement lettres
    if (settings.letterSpacing) {
      root.classList.add("wide-spacing");
    } else {
      root.classList.remove("wide-spacing");
    }
  }, [settings]);

  const cycleFontSize = (dir: "up" | "down") => {
    const sizes: A11ySettings["fontSize"][] = ["normal", "large", "xlarge"];
    const idx = sizes.indexOf(settings.fontSize);
    const next = dir === "up"
      ? Math.min(idx + 1, sizes.length - 1)
      : Math.max(idx - 1, 0);
    setSettings(s => ({ ...s, fontSize: sizes[next] }));
  };

  const fontLabel = {
    normal: "Normal (17px)",
    large: "Grand (20px)",
    xlarge: "Très grand (23px)",
  }[settings.fontSize];

  return (
    <>
      {/* Container flottant */}
      <div className="fixed bottom-8 right-10 z-50 w-14 h-14">
        
        {/* Texte en demi-cercle avec effet machine à écrire */}
        {!open && showTooltip && (
          <div className="absolute top-1/2 left-1/2 pointer-events-none">
            {textChars.map((char, i) => {
              const startAngle = -90; // Demi-cercle exact (gauche)
              const endAngle = 90;    // Demi-cercle exact (droite)
              const radius = 60;      // Rayon du demi-cercle
              
              const angle = startAngle + i * ((endAngle - startAngle) / (textChars.length - 1));
              return (
                <span
                  key={i}
                  className="absolute text-gray-800 font-black text-sm drop-shadow-sm"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${radius}px)`,
                    opacity: i < typedChars ? 1 : 0,
                    transition: "opacity 0.1s ease-in-out"
                  }}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              );
            })}
          </div>
        )}

        {/* Bouton flottant */}
        <button
          onClick={() => {
            setOpen(!open);
            setShowTooltip(false);
          }}
          aria-label="Ouvrir les options d'accessibilité"
          aria-expanded={open}
          className="w-14 h-14 flex-shrink-0 rounded-full bg-gray-900 text-white shadow-[0_0_20px_rgba(0,0,0,0.3)] flex items-center justify-center hover:bg-gray-700 transition-all hover:scale-110 focus:outline-none focus:ring-4 focus:ring-gray-900 focus:ring-offset-2"
        >
          <Accessibility size={26} />
        </button>
      </div>

      {/* Panneau */}
      {open && (
        <div
          ref={widgetRef}
          role="dialog"
          aria-label="Options d'accessibilité"
          className="fixed bottom-24 right-6 z-50 bg-white border border-gray-200 rounded-2xl shadow-2xl w-72 overflow-hidden"
        >
          {/* En-tête */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
            <div>
              <p className="text-sm font-semibold text-gray-900">Accessibilité</p>
              <p className="text-xs text-gray-400 mt-0.5">Personnalisez votre lecture</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fermer"
              className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-400 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Options */}
          <div className="p-5 flex flex-col gap-5">

            {/* Taille de texte */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Type size={16} className="text-gray-500" />
                <p className="text-sm font-medium text-gray-700">Taille du texte</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => cycleFontSize("down")}
                  disabled={settings.fontSize === "normal"}
                  aria-label="Réduire la taille du texte"
                  className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ZoomOut size={18} />
                </button>
                <div className="flex-1 text-center">
                  <span className="text-sm font-medium text-gray-900">{fontLabel}</span>
                  <div className="flex justify-center gap-1.5 mt-2">
                    {(["normal", "large", "xlarge"] as const).map((s) => (
                      <div
                        key={s}
                        className={`h-1 rounded-full transition-all ${settings.fontSize === s ? "w-6 bg-gray-900" : "w-2 bg-gray-200"}`}
                      />
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => cycleFontSize("up")}
                  disabled={settings.fontSize === "xlarge"}
                  aria-label="Augmenter la taille du texte"
                  className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ZoomIn size={18} />
                </button>
              </div>
            </div>

            {/* Contraste élevé */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun size={16} className="text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Contraste élevé</p>
                  <p className="text-xs text-gray-400">Texte plus lisible</p>
                </div>
              </div>
              <button
                role="switch"
                aria-checked={settings.highContrast}
                onClick={() => setSettings(s => ({ ...s, highContrast: !s.highContrast }))}
                aria-label="Activer le contraste élevé"
                className={`relative w-12 h-6 rounded-full transition-colors ${settings.highContrast ? "bg-gray-900" : "bg-gray-200"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.highContrast ? "translate-x-6" : "translate-x-0"}`} />
              </button>
            </div>

            {/* Espacement lettres */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Type size={16} className="text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Espacement des lettres</p>
                  <p className="text-xs text-gray-400">Facilite la dyslexie</p>
                </div>
              </div>
              <button
                role="switch"
                aria-checked={settings.letterSpacing}
                onClick={() => setSettings(s => ({ ...s, letterSpacing: !s.letterSpacing }))}
                aria-label="Activer l'espacement des lettres"
                className={`relative w-12 h-6 rounded-full transition-colors ${settings.letterSpacing ? "bg-gray-900" : "bg-gray-200"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.letterSpacing ? "translate-x-6" : "translate-x-0"}`} />
              </button>
            </div>

            {/* Reset */}
            <button
              onClick={() => setSettings(defaults)}
              className="w-full text-sm text-gray-400 hover:text-gray-600 py-2 border-t border-gray-100 pt-4 transition-colors"
            >
              Réinitialiser les paramètres
            </button>
          </div>
        </div>
      )}
    </>
  );
}