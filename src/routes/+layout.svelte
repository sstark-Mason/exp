<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
    import Themes from '$lib/Theme/themes.svelte';

	let { children } = $props();
</script>
<Themes></Themes>
<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- {@render children()} -->

{@render children?.()}
