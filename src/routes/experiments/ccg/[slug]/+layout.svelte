<script lang="ts">
    import { PUBLIC_ENV } from '$env/static/public';
    import { page } from '$app/state';
    import { beforeNavigate, goto, afterNavigate} from '$app/navigation';
    
    // import ToggleDebug from '$svexplib/Tools/ToggleDebug.svelte';
    import Debug from '$svexplib/Tools/Debug.svelte';

    import * as ccg from '$lib/ccg/ccg.svelte.ts';
    const debug = ccg.debugBase.extend('[slug]:+layout.svelte');

    let { data, children } = $props();

    const exp = ccg.initExperimentState({
        pID: () => data.pID,
        userRole: () => data.userRole,
    });

    // svelte-ignore state_referenced_locally
        if (data.validExperiment) {
        exp.dbInitSession();
    }

    beforeNavigate((nav) => {
        const targetSlug = nav.to?.params?.slug;
        if (!targetSlug) {
            debug("No target slug found in navigation params.");
            return;
        }
        const permitted = exp.routePermission(targetSlug);
        if (!permitted) {
            const currentSlug = data.slug;
            debug(`Navigation to slug '${targetSlug}' not permitted; canceling navigation.`);
            nav.cancel();
        } else {
            debug(`Navigation to slug '${targetSlug}' permitted.`);
            goto(targetSlug);
        }
    });

    afterNavigate((nav) => {
        // const currentSlug = nav.to?.params?.slug; // Same as data.slug now
        const currentSlug = data.slug;
        const permitted = exp.routePermission(currentSlug);
        if (!permitted) {
            const nextPermittedRoute = exp.nextPermittedRoute(currentSlug);
            debug(`Current slug '${currentSlug}' not permitted after navigation. Redirecting to ${nextPermittedRoute}.`);
            goto(nextPermittedRoute);
        } else {
            debug(`Current slug '${currentSlug}' permitted after navigation.`);
        }
    });

    // Alternative implementation using Satan's $effect rune.
    // $effect(() => {
    //     const currentSlug = data.slug;
    //     // debug(`page.params.slug: ${page.params.slug}`); // Same as data.slug now
    //     // debug(`data.slug: ${data.slug}`); // Same as page.params.slug now
    //     const permitted = exp.routePermission(currentSlug);
    //     if (!permitted) {
    //         const nextPermittedRoute = exp.nextPermittedRoute(currentSlug);
    //         debug(`Current slug '${currentSlug}' not permitted on effect. Redirecting to next or latest route (${nextPermittedRoute}).`);
    //         goto(nextPermittedRoute);
    //     }
    // })

</script>

<div class="exp">

    <div class="sidebar exp-nav">
        <!-- {#each exp.routeStates as route}
            <div>
                {#if route.permitted}
                    {#if route.route === data.slug}
                        <strong>{route.route.replace(/-/g, ' ')}</strong>
                    {:else}
                        <a href='{route.route}'>{route.route.replace(/-/g, ' ')}</a>
                    {/if}
                {:else}
                    <span style="color: gray;">{route.route.replace(/-/g, ' ')}</span>
                {/if}
            </div>
        {/each} -->
        <h3>Pages</h3>
        {#each exp.routeStates as route}
        {#if route.permitted && route.revisitAfterCompleted}
        <div class="nav-page-entry">
            {#if route.route === data.slug}
                <strong>{route.route.replace(/_/g, ' ')}</strong>
            {:else if route.permitted}
                <a href='{route.route}'>{route.route.replace(/_/g, ' ')}</a>
            {/if}
        </div>
        {/if}
        {/each}
    </div>

    <div class="page">
        {@render children()}
    </div>

    <div class="sidebar exp-info">
        <h3>Experiment Info</h3>
        Role: {exp.userRole}
        <br>
        pID: {exp.pID}
        {#if PUBLIC_ENV === 'dev'}
            <br><br>
            <p>Route: {page.url.pathname}</p>
            <p>User Role: {exp.userRole}</p>
            <p>dbUID: {exp.dbUID}</p>
            <p>Status: {data.status}</p>
            <p>Slug: {data.slug}</p>
            <button onclick={() =>  debug(exp.getExperimentStateDebugInfo())}>Print Experiment State</button>
        {/if}
    </div>

</div>


<Debug/>


<style>
    :global(:root) {
        --sidebar-bg: #f0f0f0;
        --sidebar-entry: #d0d0d0;
        
    }

    :global(.dark) {
        --sidebar-bg: #000;
        --sidebar-entry: #222;
    }

    .exp {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        min-height: 100vh;
    }

    .sidebar {
        display: flex;
        flex-direction: column;
        flex: 0 0 20%;
        max-width: 200px;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 5px;
        background-color: var(--sidebar-bg);
        text-align: center;

        h3 {
            margin-top: 0;
            margin-bottom: 10px;
        }
    }

    .nav-page-entry {
        margin: 1px;
        padding: 4px;
        border: 1px solid black;
        border-radius: 5px;
        background-color: var(--sidebar-entry);
    }
    
    .page {
        flex: 1;
        min-width: 0;
        max-width: 800px;
        padding: 20px;
        margin: 0 auto;
    }

    @media (max-width: 1200px) {
        .exp {
            flex-direction: column;
        }
        .sidebar {
            flex: none;
            width: 100%;
            border: none;
            padding: 10px 0;
        }
        .page {
            width: 100%;
        }
    }

</style>





