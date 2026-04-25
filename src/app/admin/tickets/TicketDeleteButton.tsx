"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteTicket } from "@/app/actions/tickets";

export default function TicketDeleteButton({ ticketId }: { ticketId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Voulez-vous vraiment supprimer ce billet ? Cette action est irréversible et supprimera également la commande associée.")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteTicket(ticketId);
    } catch (error) {
      alert("Erreur lors de la suppression");
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-50"
      title="Supprimer le billet"
    >
      <Trash2 className={`w-5 h-5 ${isDeleting ? 'animate-pulse' : ''}`} />
    </button>
  );
}
