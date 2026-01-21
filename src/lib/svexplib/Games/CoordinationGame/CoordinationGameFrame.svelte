<script lang="ts">
    import type { Snippet } from 'svelte';
    import debugLib from "debug";
    const debug = debugLib("exp:ccgFrame");

    export interface CoordinationGameFrameProps {
        player1Avatar: string; // Path to img
        player2Avatar: string; // Path to img
        choiceOption1: string; // Unicode char or color code
        choiceOption2: string; // Unicode char or color code
        outcomeC1C1: [number, number];
        outcomeC1C2: [number, number];
        outcomeC2C1: [number, number];
        outcomeC2C2: [number, number];
        onChoiceSelection: (choice: string) => void;
    }

    let { player1Avatar, player2Avatar, choiceOption1, choiceOption2, outcomeC1C1, outcomeC1C2, outcomeC2C1, outcomeC2C2, onChoiceSelection }: CoordinationGameFrameProps = $props();

</script>

<div class="ccg">

    <div class="ccg-game-state">
        <img src={player1Avatar} alt="Player 1 Avatar (you)" class="player-avatar"/>
        <button class="choice-button" onclick={() => onChoiceSelection(choiceOption1)}>{choiceOption1}</button>
        <button class="choice-button" onclick={() => onChoiceSelection(choiceOption2)}>{choiceOption2}</button>
        <img src={player2Avatar} alt="Player 2 Avatar (other player)" class="player-avatar"/>
    </div>

    <div class="ccg-game-payoffs">
        <table>
            <thead>
                <tr>
                    <th></th>
                    <th>They choose {choiceOption1}</th>
                    <th>They choose {choiceOption2}</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th>You choose {choiceOption1}</th>
                    <td><span class="your-payoff">({outcomeC1C1[0]}</span>, <span class="their-payoff">{outcomeC1C1[1]})</span></td>
                    <td><span class="your-payoff">({outcomeC1C2[0]}</span>, <span class="their-payoff">{outcomeC1C2[1]})</span></td>
                </tr>
                <tr>
                    <th>You choose {choiceOption2}</th>
                    <td><span class="your-payoff">({outcomeC2C1[0]}</span>, <span class="their-payoff">{outcomeC2C1[1]})</span></td>
                    <td><span class="your-payoff">({outcomeC2C2[0]}</span>, <span class="their-payoff">{outcomeC2C2[1]})</span></td>
                </tr>
            </tbody>
        </table>

    </div>

</div>

<style>
  .ccg {
    justify-self: center;
    margin: 20px;
  }

  .ccg-game-state {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    margin: 20px;
    height: var(--game-scale);
    width: calc(var(--game-scale) * 4);
    --game-scale: 150px;
    
  }

  .player-avatar {
    height: 100%;
    width: auto;
    border-radius: 10%;   
  }

  .choice-button {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: calc(var(--game-scale) * 0.6);
    height: calc(var(--game-scale) * 0.7);
    width: calc(var(--game-scale) * 0.7);
    border: none;
    border-radius: 10%;
    background: none;
    margin: 0px;
  }

  .choice-button:hover {
    background-color: rgb(226, 242, 255);
    filter: brightness(0.8);
  }

  .ccg-game-payoffs {
    justify-self: center;
  }
  
  .ccg-game-payoffs table {
    table-layout: fixed;
    border-collapse: collapse;
    width: auto;
  }

  .ccg-game-payoffs th, .ccg-game-payoffs td {
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