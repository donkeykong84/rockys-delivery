// rk-supabase.js — Supabase client singleton
const _SB = supabase.createClient(
  'https://qbavxwgxtnqfrhmumiky.supabase.co',
  'sb_publishable_uIzXvKuVxhn43pa9eu2oFA_B9EC_Ipd'
);
window._SB = _SB;
