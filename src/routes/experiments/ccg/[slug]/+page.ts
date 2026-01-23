import { error } from "@sveltejs/kit";
import debugLib from "debug";
import { getNextSlug } from "../routeOrder.ts";
const debug = debugLib("exp:ccg:[slug]:page");

export const prerender = true;
// export const trailingSlash = 'always'; // Breaks

export const entries = () => {
  return [
    { slug: 'welcome' },
    { slug: 'screening' },
    { slug: 'comprehension-intro' },
    { slug: 'game-intro' },
    { slug: 'game-ready' },
    { slug: 'game-play' },
    { slug: 'game-end' },
    { slug: 'exit-survey' },
  ];
};

export async function load({ params }) {
  try {
    // Dynamically import the SVX file based on the slug
    const page = await import(`$exp/ccg/pages/${params.slug}.svx`);
    return {
      content: page.default,
      metadata: page.metadata,
      slug: params.slug,
    };
  } catch (e) {
    // Log detailed error for debugging
    debug(`Failed to load CCG page for slug: ${params.slug}`, {
      error: e.message,
      stack: e.stack,
      status: e.status || 500,
      slug: params.slug,
    });

    // Throw a more specific error message
    const errorMessage = e.status === 404
      ? `Page not found: ${params.slug}. Check if the SVX file exists.`
      : `Server error loading page: ${params.slug}. Details: ${e.message}`;
    throw error(e.status || 500, errorMessage);
  }
}
