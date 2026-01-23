import { PUBLIC_SUPABASE_URL } from "$env/static/public";
import { PRIVATE_SUPABASE_SERVICE_KEY } from "$env/static/private";
import { createClient } from '@supabase/supabase-js';
import debugLib from 'debug';
const debug = debugLib('exp:db');

export const supabase = createClient(PUBLIC_SUPABASE_URL, PRIVATE_SUPABASE_SERVICE_KEY);

export async function retryUnmatchedRounds() {
    const { error } = await supabase.rpc('retry_unmatched_rounds');
    if (error) {
        debug('Error retrying unmatched rounds:', error);
    } else {
        debug('Successfully triggered retry of unmatched rounds.');
    }
}