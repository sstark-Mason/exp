<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { PersistedState } from "runed";
  import debugLib from "debug";
  const debug = debugLib("svexplib:CoordinationGame");

  // import player1_portrait from "$lib/assets/portraits/b_12_woman-in-black-shirt-headshot--t3chat--1.png";
  // // import player2_portrait from "$lib/assets/portraits/b_12_man-with-brown-hair-black-shirt--t3chat--1.png";
  // import portrait1 from "$lib/assets/portraits/0.2.png";
  // import portrait2 from "$lib/assets/portraits/0.4.png";
  // const portraits = [0.2, 0.4, 0.05, 0.5, 0.06, 0.9, 0.41, 0.75];

  const portraitModules = import.meta.glob("$lib/assets/portraits/*.png", {
    query: "?url",
    import: "default",
    eager: true,
  });

  const portraits = Object.values(portraitModules) as string[];

  let player1: player = $state({
    id: "player 1",
    avatar: portraits[Math.floor(Math.random() * portraits.length)],
    gender: 0,
  });

  let player2: player = $state({
    id: "player 2",
    avatar: portraits[Math.floor(Math.random() * portraits.length)],
    gender: 1,
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
    choice1: string;
  }

  function clickedChoice(choice: string) {
    debug(`Clicked choice: ${choice}`);

    gameRoundHistory.current.push({
      player1,
      player2,
      option1,
      option2,
      choice1: choice,
    });

    newRound();
  }

  function newRound() {
    [option1, option2] = drawChoices();
    if (!option1 || !option2) {
      debug("No more choices available.");
      return;
    }

    const randPortrait =
      portraits[Math.floor(Math.random() * portraits.length)];
    player2.avatar = randPortrait;
  }

  // let option_pool: string[] = ['♂', '♀', '⚥', '⚢', '⚣', '⚧', '♃', '♁', '☿', '☆', '☽', '☉', '☾', '♆', '♇', '♄', '♅', '☊', '☋', '☌', '☍', '⚸', '⚹', '⚺', '⚻', '⚼', '⚽', '⚾', '♔', '♕', '♖', '♗', '♘', '♙', '♚', '♛', '♜', '♝', '♞', '♟', '🐱‍👤',];

  const option_pool: string[] = ["♂", "♀", "♃", "☆", "♅"];
  let possible_combinations: [string, string][] = [];
  for (let i = 0; i < option_pool.length; i++) {
    for (let j = 0; j < option_pool.length; j++) {
      if (i !== j) {
        possible_combinations.push([option_pool[i], option_pool[j]]);
      }
    }
  }

  const gameRoundHistory = new PersistedState<gameRound[]>(
    "ccg-game-round-history",
    [],
  );

  possible_combinations.sort(() => 0.5 - Math.random());

  debug("Possible combinations:", possible_combinations);

  let option1: string = $state("");
  let option2: string = $state("");

  onMount(() => {
    [option1, option2] = drawChoices();
  });

  function drawChoices(): [string, string] {
    // let randomized = option_pool.sort(() => 0.5 - Math.random());
    // return [randomized[0], randomized[1]];
    let draw = possible_combinations.pop();
    return draw ? draw : ["", ""];
  }
</script>

<h2>CCG Game Round Component</h2>

<div class="ccg-game-round">
  <img src={player1.avatar} alt="Player 1 Portrait" class="player-avatar" />

  <button class="choice-button" onclick={() => clickedChoice(option1)}>
    {option1}
  </button>

  <button class="choice-button" onclick={() => clickedChoice(option2)}>
    {option2}
  </button>

  <img src={player2.avatar} alt="Player 2 Portrait" class="player-avatar" />
</div>

<style>
  .ccg-game-round {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
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
</style>
