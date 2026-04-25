import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold mb-4 text-white">Billet Introuvable</h1>
        <p className="text-neutral-400 mb-8">
          Ce billet n'existe pas ou le lien est invalide. Vérifiez votre email ou votre WhatsApp pour retrouver le bon lien.
        </p>
        <Link href="/">
          <button className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-neutral-200 transition-colors">
            Retour à l'accueil
          </button>
        </Link>
      </div>
    </main>
  );
}
