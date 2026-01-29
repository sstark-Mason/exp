import type { PageLoad } from './$types.d.ts';
import { error } from '@sveltejs/kit';
import { debugBase } from '$lib/ccg/ccg.svelte.ts';
const debug = debugBase.extend('[slug]:+page.ts');

export const load: PageLoad = async ({ params }) => {
    try {
        const page = await import(`../pages/${params.slug}.svx`);
        return {
            content: page.default,
            metadata: page.metadata,
        };
    } catch (e: any) {
        throw error(404, `Could not load page '${params.slug}': ${e.message}`);
    }
};