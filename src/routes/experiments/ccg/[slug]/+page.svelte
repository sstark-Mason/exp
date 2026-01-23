<script lang="ts">
    import { onMount } from 'svelte';
    import { preloadData } from '$app/navigation';
    import { page } from '$app/state';
    import { getNextSlug } from '$exp/ccg/routeOrder';

    let { data } = $props();
    const nextSlug = $derived(getNextSlug(data.slug));

    $effect(() => {
        if (nextSlug) {
            preloadData(`/experiments/ccg/${nextSlug}`);
        }
    });

</script>

<data.content/>
