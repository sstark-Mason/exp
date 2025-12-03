import { error } from '@sveltejs/kit';
import debugLib from "debug";
const debug = debugLib("exp:ccg:[slug]:page");

export async function load({ params }) {
    try {
        // Dynamically import the SVX file based on the slug
        const post = await import(`$exp/ccg/pages/${params.slug}.svx`);
        return {
            content: post.default,
            metadata: post.metadata
        };
    } catch (e) {
        throw error(404, 'Page not found');
    }
}