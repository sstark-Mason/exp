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

    <div class="exp-nav">
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
        {#each exp.routeStates as route}
        <div>
            {#if route.revisitAfterCompleted}
                {#if route.route === data.slug}
                    <strong>{route.route.replace(/_/g, ' ')}</strong>
                {:else if route.permitted}
                    <a href='{route.route}'>{route.route.replace(/_/g, ' ')}</a>
                {/if}
            {/if}
        </div>
        {/each}
    </div>

    <div class="page">
        {@render children()}
    </div>

    <div class="exp-info">
        <h3>Experiment Info</h3>
        <p>Role: {exp.userRole}</p>
        <p>pID: {exp.pID}</p>
        {#if PUBLIC_ENV === 'dev'}
            <br><br>
            <p>Route: {page.url.pathname}</p>
            
            <p>User Role: {exp.userRole}</p>
            <p>dbUID: {exp.dbUID}</p>
            <p>Status: {data.status}</p>
            <p>Slug: {data.slug}</p>
            <button onclick={() =>  debug(exp.getExperimentStateDebugInfo())}>Print Experiment State</button>
            <!-- <Debug/> -->
        {/if}
    </div>

</div>

<!-- <ToggleDebug/> -->

<Debug/>


<style>
    .exp {
        display: flex;
        flex-direction: row;
    }
    .exp-nav {
        width: 200px;
        border-right: 1px solid #ccc;
        padding-right: 10px;
    }
    .page {
        flex: 1;
        padding: 20px;
    }
    .exp-info {
        width: 200px;
        border-left: 1px solid #ccc;
        padding-left: 10px;
    }
</style>





