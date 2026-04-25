"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteTicket } from "@/app/actions/tickets";
import { useRouter } from "next/navigation";

export default function TicketDeleteButton({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    if (!confirm("Voulez-vous vraiment supprimer ce billet ? Cette action est irréversible et supprimera également la commande associée.")) {
      return;
    }

    setIsDeleting(true);
    startTransition(async () => {
      const result = await deleteTicket(ticketId);
      if (!result.success) {
        alert("Erreur lors de la suppression : " + (result.error ?? "raison inconnue"));
        setIsDeleting(false);
        return;
      }
      // Server already revalidated /admin/tickets; trigger a router refresh
      // so the row disappears from the current view immediately.
      router.refresh();
    });
  };

  const busy = pending || isDeleting;

  return (
    <button
      onClick={handleDelete}
      disabled={busy}
      className="p-2 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-50"
      title="Supprimer le billet"
    >
      <Trash2 className={`w-5 h-5 ${busy ? 'animate-pulse' : ''}`} />
    </button>
  );
}
