import type { PageLoad } from './$types.d.ts';
import { error } from '@sveltejs/kit';
import { redirect } from "@sveltejs/kit";

export const load: PageLoad = async ({ params }) => {
    try {
        const page = await import(`../pages/${params.slug}.svx`);
        return {
            content: page.default,
            metadata: page.metadata,
        };
    } catch (e: any) {
        // throw error(404, `Could not load page '${params.slug}': ${e.message}`);
        throw redirect(302, "welcome");
    }
};