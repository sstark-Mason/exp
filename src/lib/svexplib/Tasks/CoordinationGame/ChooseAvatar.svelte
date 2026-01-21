<script lang="ts">
  import { PersistedState } from "runed";
  import debugLib from "debug";
  const debug = debugLib("exp:ChooseAvatar");

  // Keep the single import for the first portrait (if needed)
  import portrait1 from "./Portraits/blurred/1.webp";
  import portrait2 from "./Portraits/blurred/2.webp";
  import portrait3 from "./Portraits/blurred/3.webp";
  import portrait4 from "./Portraits/blurred/4.webp";
  import portrait5 from "./Portraits/blurred/5.webp";
  import portrait6 from "./Portraits/blurred/6.webp";
  import portrait8 from "./Portraits/blurred/8.webp";
  import portrait8_1 from "./Portraits/blurred/8.1.webp";
  import portrait9 from "./Portraits/blurred/9.webp";
  import portrait10 from "./Portraits/blurred/10.webp";
  import portrait11 from "./Portraits/blurred/11.webp";
  import portrait12 from "./Portraits/blurred/12.webp";
  import portrait13 from "./Portraits/blurred/13.webp";
  let portraits: string[] = [];
  // portraits = [portrait1, portrait2, portrait3, portrait4, portrait5, portrait6, portrait8, portrait8_1, portrait9, portrait10, portrait11, portrait12, portrait13];
  portraits = [portrait1, portrait6];
  debug("Loaded portraits:", portraits);
  portraits = shuffleArray(portraits);

  const selectedAvatar = new PersistedState<string | null>("ccg-selected-avatar", null);
  
  function selectAvatar(index: number) {
    const clickedAvatar = portraits[index];
    selectedAvatar.current = clickedAvatar ? clickedAvatar : null;
    debug("Clicked avatar:", clickedAvatar);
  }

  function shuffleArray(array: string[]): string[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }


</script>

<div class="avatar-grid">
  {#each portraits as portrait, i}
    <button 
      class:selected={selectedAvatar.current === portrait}
      onclick={() => selectAvatar(i)}
    >
      <img src={portrait} alt="Portrait" />
    </button>
  {/each}
</div>

<style>

  .avatar-grid {
    display: grid;
    grid-template-columns: repeat(4, 150px);
    justify-content: center;
    gap: 10px;
  }

  button {
    background: none;
    border: none; /* 2px solid transparent if you want to keep size consistent */
    padding: 0;
    cursor: pointer;
    width: 100%;
    height: auto;
    box-sizing: border-box;
    &:hover {
      opacity: 0.9;
    }
  }

  button.selected {
    border: 2px solid blue; /* Border for selected button */
  }

  img {
    width: 100%;
    height: auto;
    display: block;
  }
</style>