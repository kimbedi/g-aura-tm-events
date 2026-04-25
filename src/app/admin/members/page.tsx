"use client";

import { useEffect, useState } from "react";
import { getMembers, updateMemberRole } from "@/app/actions/members";
import { User, Shield, Check, Loader2, Search } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

export default function MembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      const data = await getMembers();
      setMembers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(userId: string, newRole: string) {
    setUpdatingId(userId);
    try {
      await updateMemberRole(userId, newRole);
      await loadMembers();
    } catch (e) {
      alert("Erreur lors de la mise à jour");
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredMembers = members.filter(m => 
    m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.id.includes(search)
  );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Gestion des Membres</h1>
        <p className="text-neutral-400 text-sm">Attribuez des rôles aux utilisateurs de la plateforme.</p>
      </header>

      <div className="mb-8 relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <input 
          type="text" 
          placeholder="Rechercher un membre..." 
          className="w-full bg-neutral-900 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-yellow-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-neutral-900 border border-white/5 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-xs uppercase text-neutral-500 font-bold">
                <th className="px-6 py-4">Membre</th>
                <th className="px-6 py-4">Rôle Actuel</th>
                <th className="px-6 py-4">Modifier le Rôle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-yellow-500" />
                  </td>
                </tr>
              ) : filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <div className="font-bold text-sm">{member.full_name || "Sans nom"}</div>
                          {member.id === currentUserId && (
                            <span className="text-[8px] bg-white/10 text-white px-1.5 py-0.5 rounded uppercase">C'est vous</span>
                          )}
                        </div>
                        <div className="text-[10px] text-neutral-500 font-mono">{member.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      member.role === 'super_admin' ? 'bg-indigo-500/20 text-indigo-400' :
                      member.role === 'admin' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-neutral-800 text-neutral-400'
                    }`}>
                      {member.role === 'super_admin' ? 'DevTool' : member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <select 
                        value={member.role}
                        disabled={updatingId === member.id || member.role === 'super_admin' || member.id === currentUserId}
                        onChange={(e) => handleRoleChange(member.id, e.target.value)}
                        className={`bg-black border border-white/10 rounded-lg text-xs px-2 py-1 focus:outline-none focus:border-yellow-500 ${
                          (member.role === 'super_admin' || member.id === currentUserId) ? 'opacity-30 cursor-not-allowed' : 'opacity-100'
                        }`}
                      >
                        <option value="user">Utilisateur</option>
                        <option value="scanner">Scanner</option>
                        <option value="manager">Manager</option>
                        {member.role === 'admin' && <option value="admin">Admin</option>}
                        {member.role === 'super_admin' && <option value="super_admin">DevTool</option>}
                      </select>
                      {updatingId === member.id && <Loader2 className="w-3 h-3 animate-spin text-yellow-500" />}
                      {member.role === 'super_admin' && <Shield className="w-3 h-3 text-indigo-400 opacity-50" />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
