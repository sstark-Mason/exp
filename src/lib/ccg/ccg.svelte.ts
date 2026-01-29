import { getContext, setContext } from 'svelte';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUB_KEY } from "$env/static/public";
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUB_KEY, {
    global: {
        fetch: (url, options) => {
            return fetch(url, { ...options, keepalive: true });
        }
    }
});

import { newDebugger } from '$svexplib/Tools/Debug.svelte.ts';
export const debugBase = newDebugger('exp:ccg');
const debug = debugBase.extend('ccg.svelte.ts');

export enum UserRole {
    Tester = 'tester',
    Participant = 'participant',
    Unspecified = 'unspecified',
    Unknown = 'unknown'
}

export function validateUserRole(role: string | null): UserRole {
    switch (role) {
        case 'tester':
            return UserRole.Tester;
        case 'participant':
            return UserRole.Participant;
        case 'unspecified':
            return UserRole.Unspecified;
        case null:
            return UserRole.Unspecified;
        default:
            return UserRole.Unknown;
    }
}

export class ExperimentState {
    #userRole = $state<UserRole>(UserRole.Unspecified);
    #pID = $state<string | null>(null);
    #routeStates = $state<RouteState[]>([]);
    #dbUID = $state<string | null>(null);

    constructor(initial: { pID: () => string | null; userRole: () => string | null; }) {
        debug('ExperimentState initialized with pID: ', initial.pID(), 'and userRole: ', initial.userRole());
        this.#pID = initial.pID();
        this.#userRole = validateUserRole(initial.userRole());
        this.#dbUID = null;
        this.#routeStates = checkLocalStorageForRouteStates('ccgRouteStates');
    }

    get pID(): string | null {
        return this.#pID;
    }

    set pID(value: string | null) {
        this.#pID = value;
    }

    async dbGetPID(): Promise<string | null> {
        if (!this.#dbUID) {
            debug('Cannot get PID from DB: dbUID is null');
            return null;
        }
        const { data, error } = await supabase
            .from('participants')
            .select('pid')
            .eq('uid', this.#dbUID)
            .single();
        if (error) {
            debug('Error fetching PID from DB:', error);
            return null;
        }
        debug('Fetched PID from DB:', data?.pid);
        return data?.pid || null;
    }

    get userRole(): UserRole {
        return this.#userRole;
    }

    get dbUID(): string | null {
        return this.#dbUID;
    }

    async dbInitSession() {
        debug('Initializing database session for experiment participant');
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
            debug('Error getting session:', error);
        }
        if (session) {
            this.#dbUID = session.user.id;
            debug(`Existing session found; dbUID: ${this.#dbUID}`);
            return;
        } else {
            this.#dbUID = await this.dbSignInAnonymously();
            await this.dbInsertParticipant();
        }
    }

    async dbSignInAnonymously(): Promise<string | null> {
        if (this.#dbUID) return this.#dbUID;
        const { data: { session }, error } = await supabase.auth.signInAnonymously();
        if (error) {
            debug('Error signing in anonymously:', error);
            return null;
        }
        if (!session) {
            debug('Null session after anonymous sign-in: session == null');
            return null;
        }
        debug('Anonymous sign-in successful; dbUID:', session.user.id);
        return session.user.id;
    }

    async dbInsertParticipant(): Promise<boolean> {
        console.groupCollapsed('Updating participant entry in DB');
        let result = false;
        if (!this.#dbUID) {
            debug('Cannot update participant entry: dbUID is null');
            result = false;
        }
        const { error } = await supabase
            .from('participants')
            .insert([{ pid: this.pID, user_role: this.userRole }]);
        if (error) {
            debug('Error inserting/updating participant entry in db:', error);
            result = false;
        } else {
            result = true;
        }
        debug('Participant entry inserted/updated successfully in db');
        console.groupEnd();
        return result;
    }

    dbUpdateParticipant(updates: object) {
        if (!this.#dbUID) {
            debug(`Cannot update participants: dbUID is null`);
        }
        return supabase
            .from('participants')
            .update(updates)
            .eq('uid', this.#dbUID)
            .then(({ error }) => {
                if (error) {
                    debug('Error updating participant entry:', error);
                } else {
                    debug('Participant entry in db updated successfully');
                }
            });
    }

    #pendingSync: object[] = [];

    dbInsertGameRounds(updates: object, attempt = 1) {
        if (!this.#dbUID) return;
        supabase
            .from('game_rounds')
            .insert(updates)
            .eq('player_1_uid', this.#dbUID)
            .then(({ error }) => {
                if (error) {
                    debug(`Error inserting game rounds (attempt ${attempt}):`, error);
                    if (attempt < 5) {
                        const retryDelay = Math.pow(4, attempt) * 1000;
                        debug(`Retrying in ${retryDelay / 1000} s...`);
                        setTimeout(() => {
                            this.dbInsertGameRounds(updates, attempt + 1);
                        }, retryDelay);
                    } else {
                        debug('Max retry attempts reached; giving up on inserting game rounds. Data saved to pending sync queue.');
                        this.#pendingSync.push(updates);
                    }
                } else {
                    debug('Game rounds inserted successfully');
                    this.#pendingSync = this.#pendingSync.filter(u => u !== updates);
                }
            });
    }

    getExperimentStateDebugInfo(): object {
        return {
            pID: this.#pID,
            userRole: this.#userRole,
            dbUID: this.#dbUID,
        };
    }

    get routeStates(): RouteState[] {
        return this.#routeStates;
    }

    updateRouteState(route: string, completed: boolean): void {
        const routeIndex = this.#routeStates.findIndex((r) => r.route === route);
        if (routeIndex !== -1) {
            this.#routeStates[routeIndex].completed = completed;
            debug(`Route state updated: ${route} completed = ${completed}`);
            saveRouteStatesToLocalStorage('ccgRouteStates', this.#routeStates);
        } else {
            debug(`Route state update failed: route ${route} not found`);
        }
    }

    updateRoutePermission(route: string, permitted: boolean): void {
        const routeIndex = this.#routeStates.findIndex((r) => r.route === route);
        if (routeIndex !== -1) {
            this.#routeStates[routeIndex].permitted = permitted;
            debug(`Route permission updated: ${route} permitted = ${permitted}`);
            saveRouteStatesToLocalStorage('ccgRouteStates', this.#routeStates);
        } else {
            debug(`Route permission update failed: route ${route} not found`);
        }
    }

    nextRoute(currentRoute: string): string {
        return findNextRoute(this.#routeStates, currentRoute);
    }

    nextPermittedRoute(currentRoute: string): string {
        return findNextPermittedRoute(this.#routeStates, currentRoute);
    }

    nextUncompletedRoute(currentRoute: string): string {
        let nextUncompletedRoute = findNextUncompletedRoute(this.#routeStates, currentRoute);
        if (nextUncompletedRoute === currentRoute) {
            const nextRoute = this.nextRoute(currentRoute);
            if (nextRoute === currentRoute) {
                return currentRoute;
            } else {
                nextUncompletedRoute = nextRoute;
                
            }
        }
        this.updateRoutePermission(nextUncompletedRoute, true);
        return nextUncompletedRoute;
    }

    latestUncompletedRoute(): string {
        return findLatestUncompletedRoute(this.#routeStates);
    }

    latestPermittedRoute(): string {
        return findLatestPermittedRoute(this.#routeStates);
    }

    next(currentRoute: string): string {
        const nextRoute = next(this.#routeStates, currentRoute);
        debug(`Next intended route after ${currentRoute} is ${nextRoute}`);
        this.updateRoutePermission(nextRoute, true);
        return nextRoute;
    }

    routePermission(route: string): boolean {
        const routeState = this.#routeStates.find((r) => r.route === route);
        if (routeState) {
            debug(`Route permission for ${route}: ${routeState.permitted}`);
            return routeState.permitted;
        } else {
            debug(`Route permission check failed: route ${route} not found`);
            return false;
        }
    }

}

const EXPERIMENT_KEY = Symbol('EXPERIMENT_KEY');

export function initExperimentState(init: {
  pID: () => string | null;
  userRole: () => string | null;
}): ExperimentState {
  // We pass the closure-based init to the class
  return setContext(EXPERIMENT_KEY, new ExperimentState(init));
}

export function getExperimentState(): ExperimentState {
    return getContext<ExperimentState>(EXPERIMENT_KEY);
}

type RouteState = {
    route: string;
    permitted: boolean;
    required: boolean;
    completed: boolean;
    revisitAfterCompleted: boolean;
}

export const ccgRoutes: RouteState[] = [
    { route: "welcome", permitted: false, required: true, completed: false, revisitAfterCompleted: true },
    { route: "screening", permitted: false, required: true, completed: false, revisitAfterCompleted: false },
    { route: "comprehension_intro", permitted: false, required: true, completed: false, revisitAfterCompleted: true },
    { route: "game_intro", permitted: false, required: true, completed: false, revisitAfterCompleted: true },
    { route: "game_ready", permitted: false, required: true, completed: false, revisitAfterCompleted: false },
    { route: "game_play", permitted: false, required: true, completed: false, revisitAfterCompleted: false },
    { route: "game_end", permitted: false, required: true, completed: false, revisitAfterCompleted: false },
    { route: "post-game_survey", permitted: false, required: true, completed: false, revisitAfterCompleted: true },
    { route: "exit", permitted: false, required: true, completed: false, revisitAfterCompleted: true },
];

function checkLocalStorageForRouteStates(key: string): RouteState[] {
    const stored = localStorage.getItem(key);
    if (stored) {
        debug(`Found existing route states in localStorage under key ${key}`);
        return JSON.parse(stored);
    } else {
        debug(`No existing route states found in localStorage under key ${key}; initializing default states`);
        return ccgRoutes;
    }
}

function saveRouteStatesToLocalStorage(key: string, routeStates: RouteState[]): void {
    localStorage.setItem(key, JSON.stringify(routeStates));
    debug(`Saved route states to localStorage under key ${key}`);
}

function findLatestPermittedRoute(routeStates: RouteState[]): string {
    let nextRoute: string = '';
    for (let i = routeStates.length - 1; i >= 0; i--) {
        const routeState = routeStates[i];
        if (routeState.permitted) {
            debug(`Latest permitted route found: ${routeState.route}`);
            nextRoute = routeState.route;
            break;
        }
    }
    return nextRoute;
}

function findNextPermittedRoute(routeStates: RouteState[], currentRoute: string): string {
    const currentIndex = routeStates.findIndex(r => r.route === currentRoute);
    if (currentIndex === -1) {
        debug(`Current route ${currentRoute} not found in route states`);
        return currentRoute;
    }
    let nextRoute: string = '';
    for (let i = currentIndex; i < routeStates.length; i++) {
        const routeState = routeStates[i];
        if (routeState.permitted) {
            debug(`Next permitted route found: ${routeState.route}`);
            nextRoute = routeState.route;
            break;
        }
    }
    if (!nextRoute) {
        nextRoute = findLatestPermittedRoute(routeStates);
    }
    return nextRoute || currentRoute;
}

function findNextUncompletedRoute(routeStates: RouteState[], currentRoute: string): string {
    const currentIndex = routeStates.findIndex(r => r.route === currentRoute);
    if (currentIndex === -1) {
        debug(`Current route ${currentRoute} not found in route states`);
        return currentRoute;
    }
    let nextRoute: string = '';
    for (let i = currentIndex; i < routeStates.length; i++) {
        const routeState = routeStates[i];
        if (routeState.permitted && !routeState.completed) {
            debug(`Next uncompleted permitted route found: ${routeState.route}`);
            nextRoute = routeState.route;
            break;
        }
    }
    return nextRoute || currentRoute;
}

function findLatestUncompletedRoute(routeStates: RouteState[]): string {
    let latestRoute: string = '';
    for (let i = routeStates.length - 1; i >= 0; i--) {
        const routeState = routeStates[i];
        if (routeState.permitted && !routeState.completed) {
            debug(`Latest uncompleted permitted route found: ${routeState.route}`);
            latestRoute = routeState.route;
            break;
        }
    }
    if (!latestRoute) {
        latestRoute = findLatestPermittedRoute(routeStates);
    }
    return latestRoute;
}

function findNextRoute(routeStates: RouteState[], currentRoute: string): string {
    const currentIndex = routeStates.findIndex(r => r.route === currentRoute);
    if (currentIndex === -1) {
        debug(`Current route ${currentRoute} not found in route states`);
        return currentRoute;
    }
    return routeStates[currentIndex + 1]?.route || currentRoute;
}

function next(routeStates: RouteState[], currentRoute: string): string {
    const currentIndex = routeStates.findIndex(r => r.route === currentRoute);
    if (currentIndex === -1) {
        debug(`Current route ${currentRoute} not found in route states`);
        return currentRoute;
    }

    let nextPermittedRoute = null;
    let nextUncompletedRoute = null;

    for (let i = currentIndex + 1; i < routeStates.length; i++) {
        const routeState = routeStates[i];
        if (nextPermittedRoute === null && routeState.permitted) {
            nextPermittedRoute = routeState.route;
            break;
        }
        if (nextUncompletedRoute === null && routeState.completed === false) {
            nextUncompletedRoute = routeState.route;
        }
    }

    return nextPermittedRoute || nextUncompletedRoute || currentRoute;
}