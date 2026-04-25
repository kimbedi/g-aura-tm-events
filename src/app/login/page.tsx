"use client";

import { login } from "@/app/actions/auth";
import { useState } from "react";
import Link from "next/link";
import { Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    const result = await login(formData);
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
            G-AURA <span className="text-yellow-500 font-light">ACCESS</span>
          </h1>
          <p className="text-neutral-400 text-sm">Entrez dans votre espace privilégié.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-4">
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
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                name="password" 
                required 
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 pr-12 text-white focus:outline-none focus:border-yellow-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors p-1"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-yellow-500 transition-colors flex items-center justify-center mt-6 disabled:opacity-50"
          >
            {isLoading ? "Connexion..." : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Se connecter
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-neutral-500">
          Vous n'avez pas de compte ?{" "}
          <Link href="/register" className="text-white hover:text-yellow-500 font-semibold transition-colors">
            Créer un accès
          </Link>
        </div>
      </div>
    </main>
  );
}
