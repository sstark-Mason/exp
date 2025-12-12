<script lang="ts">
	
	import { PersistedState, PressedKeys } from "runed";
    import { onMount } from "svelte";

	const theme = new PersistedState("theme", "light");

	onMount(() => {
		applyTheme(theme.current)
	});

	const keys = new PressedKeys();
	keys.onKeys(["d", "a", "r", "k"], () => {
        toggleLightDark();
    });
	
	keys.onKeys(["l", "i", "g", "h", "t"], () => {
        toggleLightDark();
    });

	function toggleLightDark() {
		theme.current = theme.current === "light" ? "dark" : "light";
		applyTheme(theme.current);
	}

	function applyTheme(theme: string) {
		document.documentElement.classList.toggle('dark', theme === 'dark');
		// document.documentElement.classList.toggle('light', theme === 'light'); // Use if using .light explicitly
		console.log("Applied theme:", theme);
	}


</script>

<style>

	:global(:root) {
		background-color: #ffffff;
		color: #000000;
	}

	:global(.dark) {
        background-color: #121212;
        color: #ffffff;
    }

</style>