const { createClient } = require('@supabase/supabase-js');
const config = require('../config/env');

const supabaseUrl = config.supabase.url;
const supabaseServiceRoleKey = config.supabase.serviceRoleKey;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.warn('⚠️  Supabase URL or Service Role Key is missing. Storage functionality will fail.');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

module.exports = supabase;
