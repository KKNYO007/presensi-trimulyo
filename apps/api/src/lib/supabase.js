const { createClient } = require('@supabase/supabase-js');
const config = require('../config/env');

const supabaseUrl = config.supabase.url;
const supabaseAnonKey = config.supabase.anonKey;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️  Supabase URL or Anon Key is missing. Storage functionality will fail.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = supabase;
