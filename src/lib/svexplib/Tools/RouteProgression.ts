import debugLib from "debug";
const debug = debugLib("exp:RouteProgression");
import { goto } from "$app/navigation";

export enum PermissionState {
    NotYetPermitted = "NotYetPermitted",
    Permitted = "Permitted",
    NoLongerPermitted = "NoLongerPermitted",
    Unknown = "Unknown"
}

export type RoutePermission = {
    route: string;
    state: PermissionState;
}

const defaultProgress: RoutePermission[] = [
    { route: "welcome", state: PermissionState.Permitted }
];

function getProgress(): RoutePermission[] {
    const stored = localStorage.getItem("expProgress");
    return stored ? JSON.parse(stored) : defaultProgress;
}

export function getRoutePermission(route: string): PermissionState {
    const expProgress = getProgress();
    const routeEntry = expProgress.find((entry) => entry.route === route);
    switch (routeEntry?.state) {
        case PermissionState.Permitted:
            return PermissionState.Permitted;
        case PermissionState.NoLongerPermitted:
            return PermissionState.NoLongerPermitted;
        case PermissionState.NotYetPermitted:
            return PermissionState.NotYetPermitted;
        default:
            debug(`Unknown permission state for route ${route}. Defaulting to NotYetPermitted.`);
            return PermissionState.NotYetPermitted;
    }
}

export function setRoutePermission(route: string, newState: PermissionState): void {
    const expProgress = getProgress();
    const routeIndex = expProgress.findIndex((entry) => entry.route === route);
    if (routeIndex !== -1) {
        // Already exists: update state
        expProgress[routeIndex].state = newState;
        debug(`Updated route ${route} to state ${newState}.`);
    } else {
        // Does not exist: add new entry
        expProgress.push({ route, state: newState });
        debug(`Added route ${route} with state ${newState}.`);
    }
    localStorage.setItem("expProgress", JSON.stringify(expProgress));
}

export function findNextPermittedRoute(currentRoute: string, routeOrder: string[]): string | null {
    const expProgress = getProgress();
    const currentIndex = routeOrder.indexOf(currentRoute);

    for (let i = currentIndex + 1; i < routeOrder.length; i++) {
        const nextRoute = routeOrder[i];
        const routeEntry = expProgress.find((entry) => entry.route === nextRoute);
        const routeState = routeEntry ? routeEntry.state : PermissionState.NotYetPermitted;
        switch (routeState) {
            case PermissionState.NotYetPermitted:
                return nextRoute;
            case PermissionState.Permitted:
                return nextRoute;
            case PermissionState.NoLongerPermitted:
                continue;
            case PermissionState.Unknown:
                continue;
        }
    }
    return null; // No next permitted route found
}

export function gotoNextPermittedRoute(currentRoute: string, routeOrder: string[]): void {
    const expProgress = getProgress();
    const currentIndex = routeOrder.indexOf(currentRoute);

    debug(`Current route: ${currentRoute}, index: ${currentIndex}. ExpProgress: ${JSON.stringify(expProgress)} (length: ${expProgress.length})`);

    // Check for already-permitted routes ahead of current route (for re-navigation, early exit, etc.)
    for (let i = currentIndex + 1; i < routeOrder.length; i++) {
        const nextRoute = routeOrder[i];
        const routeEntry = expProgress.find((entry) => entry.route === nextRoute);
        const routeState = routeEntry ? routeEntry.state : PermissionState.NotYetPermitted;
        if (routeState === PermissionState.Permitted) {
            debug(`Navigating to already-permitted route: ${nextRoute}`);
            goto(nextRoute);
            return;
        }
    }

    // If no already-permitted routes, add next route as newly Permitted
    const nextIndex = currentIndex + 1;
    if (nextIndex < routeOrder.length) {
        const nextRoute = routeOrder[nextIndex];
        setRoutePermission(nextRoute, PermissionState.Permitted);
        debug(`Added and navigating to new route: ${nextRoute}`);
        goto(nextRoute);
        return;
    }

    debug(`No permitted route found to navigate to from current route: ${currentRoute}`);
}


