// rk-supabase.js — Supabase client (JWT anon key, compatible with all supabase-js v2)
const _SB = supabase.createClient(
  'https://qbavxwgxtnqfrhmumiky.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFiYXZ4d2d4dG5xZnJobXVtaWt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3NDM0ODEsImV4cCI6MjA5MzMxOTQ4MX0.zdL3q5erqVeqAZ3_MBHJkKXVfaL714Xgjg-ogS4ct38'
);
window._SB = _SB;
