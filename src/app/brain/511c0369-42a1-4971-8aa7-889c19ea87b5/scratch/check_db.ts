import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing env vars")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTicket() {
  const hash = "88c07b14-fd41-4989-8750-82a5c8af401b-mhy2kq"
  console.log(`Checking ticket with hash: ${hash}`)

  const { data, error } = await supabase
    .from("issued_tickets")
    .select("*, orders(*), events(*)")
    .eq("qr_code_hash", hash)
  
  if (error) {
    console.error("Query Error:", error)
  } else if (data && data.length > 0) {
    console.log("Ticket Found:", JSON.stringify(data[0], null, 2))
  } else {
    console.log("No ticket found with this hash.")
    
    // Check all tickets to see what's in there
    const { data: allTickets } = await supabase.from("issued_tickets").select("qr_code_hash").limit(5)
    console.log("Recent hashes in DB:", allTickets?.map(t => t.qr_code_hash))
  }
}

checkTicket()
