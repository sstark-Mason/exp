import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUB_KEY } from "$env/static/public";
import { createClient } from '@supabase/supabase-js';
import { PersistedState } from "runed";
import debugLib from 'debug';
const debug = debugLib('exp:db');

export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUB_KEY);
export const db_uid = new PersistedState<string | null>('db_uid', null);

export async function newDbKey(pid: string, userRole: string): Promise<string | null> {
    const maxRetries = 3;
    let session = null;
    let signInError = null;

    const { data: { session: existingSession }, error: sessionError } = await supabase.auth.getSession();
    if (existingSession && !sessionError) {
        debug('Existing session found:', existingSession);
        return existingSession.user.id;
    }

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
        .from('participants')
        .insert([{ pid: pid, user_role: userRole }]);
    
    if (insertError) {
        debug('Error inserting new user data in db:', insertError);
        return null;
    }

    db_uid.current = session.user.id;
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

export function getSupabase() {
    return supabase;
}

export function getCurrentSession() {
    return supabase.auth.getSession();
}