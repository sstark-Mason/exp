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
		// document.documentElement.classList.toggle('dark', theme === 'dark'); // Use if themes are none & .dark
		// document.documentElement.classList.toggle('light', theme === 'light'); // Use if themes are .light & .dark
		document.documentElement.style.colorScheme = theme; // Only handles light, dark, and none.
		console.log("Applied theme:", theme);
	}


</script>

<style>

	:global {

		:root {
			color-scheme: light dark;
			--root-bg-inner: light-dark(rgba(250, 250, 250, 0.8), rgba(34, 34, 34, 0.8));
			--root-bg-outer: light-dark(rgba(208, 208, 208, 0.8), rgba(0, 0, 0, 0.8));
			--root-bg-far-outer: light-dark(rgba(136, 136, 136, 0.8), rgba(0, 0, 0, 0.8));
			/* --root-bg-inner: light-dark(green, purple); */
			/* --root-bg-outer: light-dark(rgba(255, 0, 0, 0.829), rgba(0, 0, 235, 0.818)); */
			--sidebar-bg: light-dark(#f0f0f0, #000000);
			--sidebar-page-nav: light-dark(#d0d0d0, #222222);
			--page-width: 800px;
			--sidebar-width: 12rem;
			background-color: var(--root-bg-outer);
			
			/* Square shading */
			/* background:
				linear-gradient(to right,
					var(--root-bg-outer) 0%,
					transparent calc(var(--sidebar-width) + var(--fade)),
					transparent calc(100% - var(--sidebar-width) - var(--fade)),
					var(--root-bg-outer) 100%),
				linear-gradient(to bottom,
					var(--root-bg-outer) 0%,
					transparent 5%,
					transparent 95%,
					var(--root-bg-outer) 100%); */

			/* Square shading (alternative, darker corners) */
			/* background:
				linear-gradient(to right,
					var(--root-bg-outer) 0%,
					var(--root-bg-inner) calc(var(--sidebar-width) + var(--fade)),
					var(--root-bg-inner) calc(100% - var(--sidebar-width) - var(--fade)),
					var(--root-bg-outer) 100%),
				linear-gradient(to bottom,
					var(--root-bg-outer) 0%,
					var(--root-bg-inner) 5%,
					var(--root-bg-inner) 95%,
					var(--root-bg-outer) 100%); */

			/* background-blend-mode: multiply; */


			/* Column shading */
			/* --fade: 3%;
			background: linear-gradient(
				to right,
				var(--root-bg-outer) 0%,
				var(--root-bg-inner) calc(var(--sidebar-width) + var(--fade)),
				var(--root-bg-inner) calc(100% - var(--sidebar-width) - var(--fade)),
				var(--root-bg-outer) 100%
			); */


			/* Column shading. Doesn't resize as naturally as ellipse */
			/* background: linear-gradient(
				to right,
				var(--root-bg-far-outer) 0%,
				var(--root-bg-outer) 10%,
				var(--root-bg-inner) 20%,
				var(--root-bg-inner) 80%,
				var(--root-bg-outer) 90%,
				var(--root-bg-far-outer) 100%
			); */

			min-height: 100vh;
			background: radial-gradient(
				ellipse 40% 100% at 50% 50%,
				var(--root-bg-inner) 0%,
				var(--root-bg-inner) 80%,
				var(--root-bg-outer) 100%,
				var(--root-bg-far-outer) 200%
			);
			background-attachment: fixed;

			

			}

		.layout {
			display: grid;
			grid-template-columns: var(--sidebar-width) auto var(--sidebar-width);
			grid-template-rows: auto;
			gap: 1rem;
			align-items: start;
		}

		.page {
			grid-column: 2;
			width: var(--page-width);
			min-height: 92vh;
			padding: 20px;
			justify-self: center;
			/* background-color: transparent; */
			/* background-color: rgba(255, 255, 255, 0.8); */
			/* mix-blend-mode: multiply; */
		}

		.sidebar {
			grid-column: auto;
			grid-row: auto;
			display: flex;
			flex-direction: column;
			padding: 0.5rem;
			text-align: center;
			box-sizing: border-box;
			border-radius: 10px;
			position: sticky;
			height: auto;
			gap: 0rem;
			align-items: center;
			top: 1rem;
			view-transition-name: sidebar;

			& h3 {
				margin-top: 0;
				margin-bottom: 10px;
			}

			.nav-item {
				font-size: 1.1rem;
				font-weight: bold;
				margin: -1px;
				padding: 0.5rem;
				/* margin: 0.5rem; */
				border: 1px solid black;
				background-color: var(--root-bg-outer);
				
				background: linear-gradient(to right, var(--root-bg-outer) 0%, var(--root-bg-inner) 30%, var(--root-bg-inner) 70%, var(--root-bg-outer) 100%);
				width: 90%;

				& a {
					text-decoration: none;
					color: darkblue;
					display: block;
					&:hover {
						text-decoration: underline;
					}
				}
			}

		}

		@media (min-width: 1281px) {
		}

		@media (max-width: 1280px) and (min-width: 1080px) {
			.layout {
				grid-template-columns: var(--sidebar-width) auto;
				grid-template-rows: auto;
			}

			.sidebar {
				&.exp-nav {
					grid-column: 1;
					grid-row: 1;
					align-self: start;
				}

				&.exp-info {
					grid-column: 1;
					grid-row: 1;
					align-self: end;
				}
			}
		}

		@media (max-width: 1079px) {
			.layout {
				grid-template-columns: auto;
				grid-template-rows: auto auto auto;
			}

			.page {
				grid-column: auto;
				grid-row: auto;
				margin: 0;
			}

			.sidebar {
				position: static;
				grid-column: auto;
				grid-row: auto;
				width: 100%;
			}
		}
	}

</style>