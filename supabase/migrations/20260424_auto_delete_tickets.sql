-- Enable pg_cron extension if not already enabled (Requires Supabase Superuser privileges)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a function to delete expired tickets
CREATE OR REPLACE FUNCTION public.delete_expired_tickets()
RETURNS void AS $$
BEGIN
  -- Delete all issued_tickets where the associated event happened more than 24 hours ago
  DELETE FROM public.issued_tickets
  WHERE event_id IN (
    SELECT id 
    FROM public.events 
    WHERE date_time < (NOW() - INTERVAL '1 day')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule the function to run every day at midnight (00:00)
SELECT cron.schedule(
  'purge-expired-tickets', -- Job Name
  '0 0 * * *',             -- Cron expression (Every day at midnight)
  'SELECT public.delete_expired_tickets()' -- SQL to execute
);
