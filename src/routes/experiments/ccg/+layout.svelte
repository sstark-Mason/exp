<script lang="ts">
    import { beforeNavigate } from '$app/navigation';
    import debugLib from "debug";
    import { onMount } from 'svelte';
    const debug = debugLib("exp:ccg:routing");


    type RoutePermission = {
        route: string;
        permitted: boolean;
    };

    type ExpProgress = RoutePermission[];

    const defaultProgress: ExpProgress = [{ route: "welcome", permitted: true }];

    onMount(() => {
        beforeNavigate(({ from, to, cancel }) => {
            if (to?.url.pathname.startsWith('/experiments/ccg/')) {
                const expProgressStr = localStorage.getItem("expProgress");
                const expProgress: ExpProgress = expProgressStr ? JSON.parse(expProgressStr) : defaultProgress;

                const pathParts = to.url.pathname.split('/');
                const slug = pathParts[pathParts.length - 1];

                const permittedRoutes = expProgress.filter(rp => rp.permitted).map(rp => rp.route);

                if (!permittedRoutes.includes(slug)) {
                    debug(`Routing to ${slug} not permitted.`);
                    cancel();
                }
            }
        });
    });

    
        
    let { children } = $props();

</script>


<div class="page-content">{@render children()}</div>

<style>

</style>