import { json } from '@sveltejs/kit';
import { supabase } from '$lib/db/db_ccg_server.ts';
import type { RequestHandler } from './$types';
import debugLib from 'debug';
const debug = debugLib('exp:api:ccg:db');

interface dbRequest {
    table: 'participants' | 'game_rounds';
    type: 'signin' | 'insert' | 'update' | 'select';
    data: any;
}

export const POST: RequestHandler = async ({ request }) => {
    if (!request) {
        return json({ success: false, error: 'No request body provided' }, { status: 400 });
    }

    const body: dbRequest = await request.json();

    if (body.type === 'signin') {
        return json({ success: false, error: 'Sign-in should probably happen on the client' }, { status: 501 });
    } else if (body.type === 'insert') {
        return json({ success: false, error: 'Insert not implemented on server' }, { status: 501 });
    } else if (body.type === 'update') {
        return json({ success: false, error: 'Update not implemented on server' }, { status: 501 });
    } else if (body.type === 'select') {
        return json({ success: false, error: 'Select not implemented on server' }, { status: 501 });
    } else {
        debug('Unsupported request type:', body.type);
        return json({ success: false, error: 'Unsupported request type' }, { status: 400 });
    }


}