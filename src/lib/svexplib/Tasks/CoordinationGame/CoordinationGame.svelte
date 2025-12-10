<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { PersistedState } from "runed";
  import debugLib from "debug";
  const debug = debugLib("svexplib:CoordinationGame");

  // Import the single portrait as before
  import portrait from "./Portraits/blurred/1.webp";

  // Array to hold the dynamically loaded portraits (as data URLs)
  let portraits: string[] = [];

  onMount(async () => {
    try {
      // List files in the blurred directory
      const dirEntries = Deno.readDir("./Portraits/blurred/");
      const imageFiles: string[] = [];
      for await (const entry of dirEntries) {
        if (entry.isFile && entry.name.endsWith('.webp')) {
          imageFiles.push(entry.name);
        }
      }

      // Sort if needed (e.g., numerically)
      imageFiles.sort((a, b) => parseInt(a.split('.')[0]) - parseInt(b.split('.')[0]));

      // Read each file and convert to data URL
      for (const file of imageFiles) {
        const filePath = `./Portraits/blurred/${file}`;
        const data = await Deno.readFile(filePath);
        const mimeType = 'image/webp'; // Adjust if not all are .webp
        const dataUrl = `data:${mimeType};base64,${btoa(String.fromCharCode(...data))}`;
        portraits.push(dataUrl);
      }

      // Trigger reactivity if needed
      portraits = [...portraits];
    } catch (error) {
      debug('Error loading portraits:', error);
    }
  });
</script>

<img src={portrait} alt="Portrait" />
<br>

{#each portraits as p}
  <img src={p} alt="Portrait" />
  <br>
{/each}

<style>
  img {
    width: 200px;
    height: auto;
    border-radius: 10px;
  }
</style>