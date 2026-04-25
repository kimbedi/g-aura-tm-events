const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://wclygaezfmthvufarabl.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjbHlnYWV6Zm10aHZ1ZmFyYWJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzA1ODk5NiwiZXhwIjoyMDkyNjM0OTk2fQ.UKRtn1GSqGH6qpvp7OF1UZIfA7JRoVvicU8NwDnxmL4";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function fixStorage() {
  console.log("Force-fix des permissions Storage...");

  // On s'assure que le bucket est public
  await supabase.storage.updateBucket('flyers', {
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/*']
  });

  console.log("✅ Bucket 'flyers' mis à jour en mode Public Total.");
  console.log("🚀 Réessaie maintenant. Si ça bloque, vérifie si ton fichier n'est pas trop lourd (> 5MB).");
}

fixStorage();
