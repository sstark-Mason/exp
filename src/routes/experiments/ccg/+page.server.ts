import type { Actions } from './$types.d.ts';
import * as ccg from '$lib/ccg/ccg.svelte.ts';
const debug = ccg.debugBase.extend('+page.server.ts');
// import debugLib from 'debug';
// const debug = debugLib('exp:ccg:+page.server.ts');
// const debug = console.debug;

import { error, redirect } from "@sveltejs/kit";

export async function load({ cookies, url }) {

    const pID = getValueFromCookies(cookies, 'pid') ?? getValueFromURL(url, 'pid');
    if (pID) {
        cookies.set('pid', pID, { path: '/', maxAge: 3600 });
    }

    const role = ccg.validateUserRole(getValueFromCookies(cookies, 'user_role') ?? getValueFromURL(url, 'role'));
    if (role) {
        cookies.set('user_role', role, { path: '/', maxAge: 3600 });
    }

    const withinQuotaCookie = getValueFromCookies(cookies, 'within_quota');
    let withinQuota: boolean | null = null;
    if (withinQuotaCookie !== null) {
        withinQuota = withinQuotaCookie === 'true';
    }

    if (role === ccg.UserRole.Participant && withinQuota === null) {
        const { data: withinQuota, error } = await ccg.supabase.rpc('check_if_within_participant_quota');
        // const withinQuota = false; // Quota test
        if (error) {
            debug('Error checking participant quota:', error);
            throw redirect(302, "ccg/quota_met");
        };
        cookies.set('within_quota', withinQuota ? 'true' : 'false', { path: '/', maxAge: 3600 });
        if (!withinQuota) {
            debug('Participant quota met; redirecting to quota-met page');
            throw redirect(302, "ccg/quota_met");
        } else {
            debug('Participant within quota; proceeding to welcome page');
            throw redirect(302, "ccg/welcome");
        };
    }

    cookies.set('within_quota', 'true', { path: '/', maxAge: 3600 });
    throw redirect(302, "ccg/welcome");
}

function getValueFromCookies(cookies: any, name: string): string | null {
    const value = cookies.get(name);
    debug(`Cookie ${name} value:`, value);
    return value !== undefined ? value : null;
}

function getValueFromURL(url: URL, name: string): string | null {
    const value = url.searchParams.get(name);
    debug(`URL parameter ${name} value:`, value);
    return value !== null ? value : null;
}

// export const actions: Actions = {
//     updatePID: async ({ cookies, params, request }) => {
//         const formData = await request.formData();
//         const newPID = formData.get('pid') as string;
//         if (newPID) {
//             cookies.set('pid', newPID, { path: '/', maxAge: 3600 });
//             debug(`Updated pid cookie to ${newPID}.`);
//         };
//         return { success: true };
//     },
// } satisfies Actions;
