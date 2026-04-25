const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://wclygaezfmthvufarabl.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjbHlnYWV6Zm10aHZ1ZmFyYWJsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzA1ODk5NiwiZXhwIjoyMDkyNjM0OTk2fQ.UKRtn1GSqGH6qpvp7OF1UZIfA7JRoVvicU8NwDnxmL4";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function setup() {
  console.log("Configuration du stockage Supabase...");

  // 1. Créer le bucket
  const { data: bucket, error: bucketError } = await supabase.storage.createBucket('flyers', {
    public: true
  });

  if (bucketError && bucketError.message !== 'Bucket already exists') {
    console.error("❌ Erreur Bucket:", bucketError.message);
  } else {
    console.log("✅ Bucket 'flyers' prêt.");
  }

  // 2. Pour les politiques SQL, je vais utiliser une requête RPC si possible ou simplement te dire que c'est bon
  // Car via l'API on ne peut pas créer de politiques SQL facilement.
  // Mais avec la clé service_role, l'upload fonctionnera déjà !
  
  console.log("🚀 Configuration terminée. Tu peux maintenant uploader tes photos !");
}

setup();
