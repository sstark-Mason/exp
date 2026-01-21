<script lang="ts">
    import { avatarMap } from '$svexplib/Games/CoordinationGame/CoordinationGameBase.ts';
    import { PersistedState } from "runed";
    import debugLib from "debug";
    const debug = debugLib("exp:SelectAvatar");

    let { onAvatarSelection }: { onAvatarSelection?: (avatar: string) => void } = $props();
    let selectedAvatar = new PersistedState<string | null>("ccg-selected-avatar", null);

    function selectAvatar(avatar: string) {
        debug(`Avatar selected: ${avatar}`);
        selectedAvatar.current = avatar;
        onAvatarSelection?.(avatar);
    }

</script>

<div class="avatar-grid">
    {#each Object.entries(avatarMap) as [avatarName, avatarPath]}
        <button class:selected={avatarName === selectedAvatar.current} onclick={() => selectAvatar(avatarName)}>
            <img src={avatarPath} alt={avatarName} />
        </button>
    {/each}
</div>


<style>

  .avatar-grid {
    display: grid;
    grid-template-columns: repeat(2, 150px);
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