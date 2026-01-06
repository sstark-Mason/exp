<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { PersistedState } from "runed";
  import debugLib from "debug";
  const debug = debugLib("svexplib:CoordinationGame");

  const selectedAvatar = new PersistedState<string | null>("ccg-selected-avatar", null);

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
  portraits = [portrait1, portrait2, portrait3, portrait4, portrait5, portrait6, portrait8, portrait8_1, portrait9, portrait10, portrait11, portrait12, portrait13];
  debug("Loaded portraits:", portraits);

  let { payoffSuccessHigh, payoffSuccessLow, onGameEnd }: {
    payoffSuccessHigh: number;
    payoffSuccessLow: number;
    onGameEnd?: () => void;
  } = $props();  

  onMount(() => {
    [option1, option2] = drawChoices();
  });

  interface player {
    id: string;
    avatar: string;
    gender: number;
  }

  interface gameRound {
    player1: player;
    player2: player;
    option1: string;
    option2: string;
    payoffSuccessHigh: number;
    payoffSuccessLow: number;
    chosen: string;
    
  }

  let player1: player = $state({
    id: "player 1",
    avatar: selectedAvatar.current ?? portraits[Math.floor(Math.random() * portraits.length)],
    gender: 0,
  });

  let player2: player = $state({
    id: "player 2",
    avatar: portraits[Math.floor(Math.random() * portraits.length)],
    gender: 1,
  });

  function clickedChoice(chosen: string) {
    debug(`Clicked choice: ${chosen}`);

    gameRoundHistory.current.push({
      player1,
      player2,
      option1,
      option2,
      payoffSuccessHigh,
      payoffSuccessLow,
      chosen: chosen,
    });

    newRound();
  }

  function newRound() {
    [option1, option2] = drawChoices();
    if (!option1 || !option2) {
      debug("Exhausted possible combinations.");
      onGameEnd?.();
      // Only repeats if component still exists after onGameEnd()
      shuffleNewGame();
      newRound();
    } else {
      const randPortrait = portraits[Math.floor(Math.random() * portraits.length)];
      player2.avatar = randPortrait;
    }
  }

  // let option_pool: string[] = ['♂', '♀', '⚥', '⚢', '⚣', '⚧', '♃', '♁', '☿', '☆', '☽', '☉', '☾', '♆', '♇', '♄', '♅', '☊', '☋', '☌', '☍', '⚸', '⚹', '⚺', '⚻', '⚼', '⚽', '⚾', '♔', '♕', '♖', '♗', '♘', '♙', '♚', '♛', '♜', '♝', '♞', '♟', '🐱‍👤',];

  
  let possible_combinations: [string, string][] = [];

  function shuffleNewGame() {
    const option_pool: string[] = ["♂", "♀", "♃", "☆", "♅"];
    for (let i = 0; i < option_pool.length; i++) {
      for (let j = 0; j < option_pool.length; j++) {
        if (i !== j) {
          possible_combinations.push([option_pool[i], option_pool[j]]);
        }
      }
    }
    possible_combinations.sort(() => 0.5 - Math.random());
    debug("Possible combinations:", possible_combinations);
  }

  const gameRoundHistory = new PersistedState<gameRound[]>(
    "ccg-game-round-history",
    [],
  );

  shuffleNewGame();

  let option1: string = $state("");
  let option2: string = $state("");

  

  function drawChoices(): [string, string] {
    // let randomized = option_pool.sort(() => 0.5 - Math.random());
    // return [randomized[0], randomized[1]];
    let draw = possible_combinations.pop();
    return draw ? draw : ["", ""];
  }

</script>

<div class="ccg-game-round">
  <div class="ccg-choices"> 
    <img src={player1.avatar} alt="Player 1 Portrait" class="player-avatar" />

    <button class="choice-button" onclick={() => clickedChoice(option1)}>
      {option1}
    </button>

    <button class="choice-button" onclick={() => clickedChoice(option2)}>
      {option2}
    </button>

    <img src={player2.avatar} alt="Player 2 Portrait" class="player-avatar" />
  </div>

  <div class="ccg-payoffs">
    <table>
      <thead>
        <tr>
          <th></th>
          <th>They choose {option1}</th>
          <th>They choose {option2}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th>You choose {option1}</th>
          <td>(<span class="your-payoff">{payoffSuccessHigh}</span>, <span class="their-payoff">{payoffSuccessLow}</span>)</td>
          <td>(0, 0)</td>
        </tr>
        <tr>
          <th>You choose {option2}</th>
          <td>(0, 0)</td>
          <td>(<span class="your-payoff">{payoffSuccessLow}</span>, <span class="their-payoff">{payoffSuccessHigh}</span>)</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

<style>
  .ccg-game-round {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
  }

  .ccg-choices {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
  }

  .ccg-payoffs {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .choice-button {
    font-size: 80px;
    background: none;
    border: 1px solid black;
    border-radius: 10%;
    cursor: pointer;
    padding: 10px;
    width: 100px;
    height: 100px;
    text-align: center;
    line-height: 80px;
  }

  .choice-button:hover {
    /* color: blue; */
    background-color: rgb(226, 242, 255);
  }

  .player-avatar {
    border-radius: 10%;
    width: 100px;
    height: 100px;
  }

  .ccg-payoffs table {
    table-layout: fixed;
    border-collapse: collapse;
    width: auto;
    
  }

  .ccg-payoffs th, .ccg-payoffs td {
    border: 1px solid black;
    padding: 5px 10px;
    text-align: center;
    font-size: 1.1em;
    font-weight: normal;
  }

  .your-payoff {
    font-weight: normal;
    text-decoration-line: underline;
  }

  .their-payoff {
    font-weight: normal;
  }
</style>