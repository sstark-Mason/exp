import debugLib from "debug";
const debug = debugLib("exp:ccg:routing");

// type RoutePermission = {
//     route: string;
//     permitted: boolean;
// };

// type ExpProgress = RoutePermission[];

// const defaultProgress: ExpProgress = [{ route: "welcome", permitted: true }];

// export function load({ params }) {

//     const progress = JSON.parse(localStorage.getItem("expProgress") || JSON.stringify(defaultProgress)) as ExpProgress;
//     const targetRoutePermitted = progress.find((p) => p.route === params.slug)?.permitted;
//     if (targetRoutePermitted) {
//         return;
//     } else {
//         const latestPermittedRoute = progress.length > 0 ? progress[progress.length - 1].route : "welcome";
//         debug(`Routing to ${params.slug} not permitted.`);

//     }
// }

