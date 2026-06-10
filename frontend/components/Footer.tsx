import Link from "next/link";
import { Heart, Mail, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white text-gray-900 mt-20 border-t border-emerald-700">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
          <div>
            <img src="/logo.png" alt="Inclusif Sénégal" className="h-78 w-auto object-contain mb-4" />
            <p className="text-sm leading-relaxed text-gray-700 max-w-xl">
              Inclusif Sénégal accompagne les personnes en situation de handicap au Sénégal avec des ressources, un forum, des offres d'emploi et des services engagés.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-5">Pages principales</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><Link href="/forum" className="hover:text-emerald-700 transition-colors">Forum</Link></li>
              <li><Link href="/medias" className="hover:text-emerald-700 transition-colors">Médias</Link></li>
              <li><Link href="/emploi" className="hover:text-emerald-700 transition-colors">Emploi</Link></li>
              <li><Link href="/education" className="hover:text-emerald-700 transition-colors">Éducation</Link></li>
              <li><Link href="/services" className="hover:text-emerald-700 transition-colors">Services</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-5">Contact</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-5">
              Un besoin ? Une question ? Nous sommes là pour vous aider.
            </p>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-emerald-700" />
                <a href="mailto:contact@inclusif.sn" className="hover:text-emerald-700 transition-colors">contact@inclusif.sn</a>
              </div>
              <div className="flex items-center gap-3">
                <MessageCircle className="h-5 w-5 text-emerald-700" />
                <span className="text-gray-700">+221 77 000 00 00</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-emerald-700 pt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm text-gray-600">
          <p>© 2025 Inclusif Sénégal — Tous droits réservés</p>
          <p className="flex items-center gap-2 text-gray-600">
            <Heart className="h-4 w-4 text-emerald-700" /> Construit pour l'inclusion
          </p>
        </div>
      </div>
    </footer>
  );
}