import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.d.ts';

export const POST: RequestHandler = async ({ request, cookies }) => {
    const { pid: newPID } = await request.json();
    if (newPID) {
        cookies.set('pid', newPID, { path: '/', maxAge: 3600 });
        return json({ success: true, message: 'Prolific ID updated successfully.' });
    } else {
        return json({ success: false, message: 'No Prolific ID provided.' }, { status: 400 });
    }
};