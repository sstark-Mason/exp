import { redirect, error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import * as ccg from '$lib/ccg/ccg.svelte.ts';
const debug = ccg.debugBase.extend('[slug]:+layout.server.ts');

export const load: LayoutServerLoad = ({ cookies, params, request, url }) => {
    const referer = request.headers.get('referer'); // What is 'direct'?
    const navIsInternal = referer && referer.includes(url.origin);
    // debug(`Layout load for slug: ${params.slug}, isInternalNav: ${navIsInternal}, referer: ${referer}`);
    
    switch (navIsInternal) {
        case true:
            // debug('Internal navigation detected; proceeding without checks.');
            return {
                slug: params.slug,
                status: 'ok',
                userRole: cookies.get('user_role') || 'unspecified',
                pID: cookies.get('pid') || null,
                withinQuota: cookies.get('within_quota') === 'true',
                validExperiment: true,
            };
        default: {
            debug('External navigation detected; validating cookies.');
            const withinQuota = cookies.get('within_quota') === 'true';
            const key = `${params.slug}-${withinQuota}`;
            switch (key) {
                case 'welcome-true': {
                    return  {
                        slug: params.slug,
                        status: 'ok',
                        userRole: cookies.get('user_role') || 'unspecified',
                        pID: cookies.get('pid') || null,
                        withinQuota: true,
                        validExperiment: true,
                    };
                }
                case 'quota_met-false': {
                    return {
                        slug: params.slug,
                        status: 'ok',
                        userRole: cookies.get('user_role') || 'unspecified',
                        pID: cookies.get('pid') || null,
                        withinQuota: false,
                        validExperiment: true,
                    };
                }
                default: throw redirect(303, `/experiments/ccg/welcome`);
            }
        }
    }
};
