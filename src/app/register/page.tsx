"use client";

import { signup } from "@/app/actions/auth";
import { useState } from "react";
import Link from "next/link";
import { UserPlus } from "lucide-react";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    const result = await signup(formData);
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-neutral-900 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-600 to-yellow-400" />
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tighter mb-2">
            G-AURA <span className="text-yellow-500 font-light">REGISTRATION</span>
          </h1>
          <p className="text-neutral-400 text-sm">Créez votre accès exclusif.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Nom complet</label>
            <input 
              type="text" 
              name="fullName" 
              required 
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Téléphone (M-Pesa / Airtel)</label>
            <input 
              type="tel" 
              name="phone" 
              placeholder="+243"
              required 
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Email</label>
            <input 
              type="email" 
              name="email" 
              required 
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Mot de passe</label>
            <input 
              type="password" 
              name="password" 
              required 
              minLength={6}
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-yellow-500 transition-colors flex items-center justify-center mt-6 disabled:opacity-50"
          >
            {isLoading ? "Création..." : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Créer mon compte
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-neutral-500">
          Vous avez déjà un compte ?{" "}
          <Link href="/login" className="text-white hover:text-yellow-500 font-semibold transition-colors">
            Connectez-vous
          </Link>
        </div>
      </div>
    </main>
  );
}
