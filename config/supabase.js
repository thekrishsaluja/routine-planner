const SUPABASE_URL      = 'https://hcwqlbjnweatwmvkcape.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhjd3FsYmpud2VhdHdtdmtjYXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MjM1ODMsImV4cCI6MjA2ODA5OTU4M30.oItoCmICG44IJ_Iai2wE1GEgK3pQW-PJbuk8TCuf3O0';

const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
