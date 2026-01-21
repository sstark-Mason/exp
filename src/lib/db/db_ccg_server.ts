import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUB_KEY } from "$env/static/public";
import { createClient } from '@supabase/supabase-js';
import debugLib from 'debug';
const debug = debugLib('exp:db');

const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUB_KEY);
const adminSupabase = createClient(PUBLIC_SUPABASE_URL, PRIVATE_SUPABASE_SERVICE_KEY);

import { PRIVATE_SUPABASE_SERVICE_KEY } from "$env/static/private";
export async function retryUnmatchedRounds() {
    const { error } = await adminSupabase.rpc('retry_unmatched_rounds');
    if (error) {
        debug('Error retrying unmatched rounds:', error);
    } else {
        debug('Successfully triggered retry of unmatched rounds.');
    }
}