import { retryUnmatchedRounds } from "$lib/db/db_ccg_server.ts";
import { fail } from '@sveltejs/kit';

export const actions = {
    retryUnmatchedRounds: async ({ request }) => {
        try {
            await retryUnmatchedRounds();
            return { success: true };
        } catch (error) {
            console.error("Error retrying unmatched rounds:", error);
            return fail(500, { error: 'Failed to retry unmatched rounds.' });
        }
    },
}