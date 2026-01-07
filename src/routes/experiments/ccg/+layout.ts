// import debugLib from "debug";
// const debug = debugLib("exp:ccg:routing");

// import { redirect } from '@sveltejs/kit';
// import type { LayoutLoad } from './$types';

// type RoutePermission = {
//     route: string;
//     permitted: boolean;
// };

// type ExpProgress = RoutePermission[];

// const defaultProgress: ExpProgress = [{ route: "welcome", permitted: true }];

// export const load: LayoutLoad = ({ url }) => {
//     // Get the slug from the URL (e.g., "welcome" from /experiments/ccg/welcome)
//     const pathParts = url.pathname.split('/');
//     const slug = pathParts[pathParts.length - 1];

//     // Simulate localStorage access (server-side safe; use cookies or session storage for persistence if needed)
//     // For simplicity, assuming localStorage is available client-side; server-side falls back to default
//     let expProgress: ExpProgress = defaultProgress;
//     if (typeof window !== 'undefined') {
//         const expProgressStr = localStorage.getItem("expProgress");
//         expProgress = expProgressStr ? JSON.parse(expProgressStr) : defaultProgress;
//     }

//     const permittedRoutes = expProgress.filter(rp => rp.permitted).map(rp => rp.route);

//     if (!permittedRoutes.includes(slug)) {
//         throw redirect(302, '/experiments/ccg/welcome'); // Redirect to a safe page
//     }

//     // If permitted, proceed
//     return {};
// };
