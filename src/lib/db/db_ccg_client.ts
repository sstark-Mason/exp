import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUB_KEY } from "$env/static/public";
import { createClient } from '@supabase/supabase-js';
import debugLib from 'debug';
const debug = debugLib('exp:db');

const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUB_KEY);

export async function newDbKey(pid: string): Promise<string | null> {
    const maxRetries = 3;
    let session = null;
    let signInError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        ({ data: { session }, error: signInError } = await supabase.auth.signInAnonymously());
        if (session && !signInError) {
            break;
        }
        debug(`Attempt ${attempt} to sign in anonymously failed:`, signInError);
    }

    if (signInError) {
        debug('Error signing in anonymously after retries:', signInError);
        return null;
    }
    
    if (!session) {
        debug('Null session after retries: session == null');
        return null;
    }

    const { error: insertError } = await supabase
        .from('subjects')
        .upsert([{ uid: session.user.id, pid: pid, start_time: new Date().toISOString() }]);
    
    if (insertError) {
        debug('Error inserting new user data in db:', insertError);
        return session.user.id;
    }

    return session.user.id;
}

export async function signOutDbKey(): Promise<boolean> {
    const { error } = await supabase.auth.signOut();
    if (error) {
        debug('Error signing out:', error);
        return false;
    }
    return true;
}


export async function updateDb(table: string, updates: Record<string, any>): Promise<boolean> {
    // Supabase auth magically handles which row to update (thanks, I hate it)
    const { error: updateError } = await supabase
        .from(table)
        .upsert(updates)

    if (updateError) {
        debug(`Error updating response data for table ${table}: ${updateError}`);
        return false;
    }

    return true;
}

export function getSupabase() {
    return supabase;
}

export function getCurrentSession() {
    return supabase.auth.getSession();
}