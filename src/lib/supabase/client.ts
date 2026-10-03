import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tsudufobyegucubmxtnl.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzdWR1Zm9ieWVndWN1Ym14dG5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0MjAzMTQsImV4cCI6MjEwNTk5NjMxNH0.cNLo7IMBUGTMCwxzEFSroXz-P3K8TBBJIMUWeIfPamc'
  );
}
