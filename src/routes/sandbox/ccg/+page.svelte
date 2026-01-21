<script lang="ts">

    import { PUBLIC_ENV } from '$env/static/public';
    import SampleDataInjector from '$svexplib/Tasks/CoordinationGame/injectSampleData.svelte';
    import { choiceSetSymbols, choiceSetColorsUnicode } from '$svexplib/Games/CoordinationGame/CoordinationGameBase.ts';
    import LiveCoordinationGame from '$svexplib/Games/CoordinationGame/LiveCoordinationGame.svelte';
    import PracticeCoordinationGame from '$svexplib/Games/CoordinationGame/PracticeCoordinationGame.svelte';
    import SelectAvatar from '$svexplib/Games/CoordinationGame/SelectAvatar.svelte';
    import { PersistedState } from "runed";
    import { goto } from '$app/navigation';

    let selectedAvatar = new PersistedState("ccg-selected-avatar", "fem1");

</script>

{#if PUBLIC_ENV === 'dev'}


<PracticeCoordinationGame
    player1Name={selectedAvatar.current}
    choiceSet={choiceSetColorsUnicode}
/>


<LiveCoordinationGame
    player1Name={selectedAvatar.current}
    choiceSet={choiceSetColorsUnicode}
    maxRounds={20}
    onGameEnd={() => { goto('/sandbox'); }}
/>

<br><br>

<SelectAvatar
    onAvatarSelection={(avatar) => {
        console.log(`Selected avatar: ${avatar}`);
        selectedAvatar.current = avatar;
    }}
/>

<br><br>

  <SampleDataInjector />
{/if}