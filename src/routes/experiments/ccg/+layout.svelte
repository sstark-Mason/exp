<script lang="ts">
    import { beforeNavigate } from '$app/navigation';
    import debugLib from "debug";
    import { onMount } from 'svelte';
    import { getRoutePermission } from '$svexplib/Tools/RouteProgression';
    const debug = debugLib("exp:ccg:routing");

    onMount(() => {
        beforeNavigate(({ from, to, cancel }) => {
            if (to?.url.pathname.startsWith('/experiments/ccg/')) {
                const pathParts = to.url.pathname.split('/');
                const slug = pathParts[pathParts.length - 1];
                const permission = getRoutePermission(slug);
                if (permission !== "Permitted") {
                    debug(`Routing to ${slug} not permitted.`);
                    cancel();
                }
            }
        })
    })

    let { children } = $props();

</script>


<div class="page-content">{@render children()}</div>

<style>

</style>