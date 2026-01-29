import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.d.ts';

export const POST: RequestHandler = async ({ request, cookies }) => {
    const { pid: newPID, role: newRole } = await request.json();
    let responseMessage = '';
    let success = true;

    switch (newPID) {
        case undefined:
        case null:
            cookies.delete('pid', { path: '/' });
            responseMessage += 'Prolific ID cookie deleted. ';
            break;
        case '':
            success = false;
            responseMessage += 'No Prolific ID provided. ';
            break;
        default:
            cookies.set('pid', newPID, { path: '/', maxAge: 3600 });
            responseMessage += 'Prolific ID updated successfully. ';
    }

    switch (newRole) {
        case undefined:
        case null:
            cookies.delete('user_role', { path: '/' });
            responseMessage += 'User role cookie deleted.';
            break;
        case '':
            success = false;
            responseMessage += 'No user role provided.';
            break;
        default:
            cookies.set('user_role', newRole, { path: '/', maxAge: 3600 });
            responseMessage += 'User role updated successfully.';
    }

    const statusCode = success ? 200 : 400;
    return json({ success, message: responseMessage.trim() }, { status: statusCode });
};