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
        // Log detailed error for debugging
        debug(`Failed to load CCG page for slug: ${params.slug}`, {
            error: e.message,
            stack: e.stack,
            status: e.status || 500,
            slug: params.slug
        });
        
        // Throw a more specific error message
        const errorMessage = e.status === 404 
            ? `Page not found: ${params.slug}. Check if the SVX file exists.` 
            : `Server error loading page: ${params.slug}. Details: ${e.message}`;
        throw error(e.status || 500, errorMessage);
    }
}