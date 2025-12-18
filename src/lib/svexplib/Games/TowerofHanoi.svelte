<script lang="ts">

    import { onMount, onDestroy, tick } from "svelte";
    import { asDroppable, asDropZone } from 'svelte-drag-and-drop-actions'
    import debugLib from "debug";
    // import  DragDropTouch  from 'svelte-drag-drop-touch' // for mobile platforms
    const debug = debugLib("svexplib:TowerOfHanoi");

    interface Disk {
        id: string,
        width: number,
        color: string,
        divref: HTMLDivElement | undefined,
    }

    interface Tower {
        id: string,
        disks: Disk[],
        blockref: HTMLDivElement | undefined,
    }

    let nDisks = $state(3);
    let disks: Disk[] = $derived.by(() => {
        let arr: Disk[] = [];
        for (let i = 0; i < nDisks; i++) {
            arr.push({
                id: `disk-${i + 1}`,
                width: 300 + (i * 150),
                color: `hsl(${(i * 360) / nDisks}, 80%, 60%)`,
                divref: undefined,
            });
        }
        return arr;
    });

    let towers: Tower[] = $state([
        { id: 'tower-1', disks: [], blockref: undefined },
        { id: 'tower-2', disks: [], blockref: undefined },
        { id: 'tower-3', disks: [], blockref: undefined },
    ]);

    onMount(() => {
        towers[0].disks = disks;
    });

    let topDisks = $derived.by(() => {
        const topDiskIds = new Array<string>();
        for (const tower of towers) {
            if (tower.disks.length > 0) {
                topDiskIds.push(tower.disks[0].id);
            }
        }
        return topDiskIds;
    });

    function onDrop (x,y, Operation, DataOffered, diskref: HTMLDivElement, tower: Tower) {

        if (!diskref.id || !tower.id) return;

        const disk: Disk = {
            id: diskref.id,
            width: parseInt(diskref.dataset.width || '', 10),
            color: diskref.style.backgroundColor,
            divref: diskref,
        };

        // debug(`Disk width: ${disk.width}`);
        if (!moveIsValid) {
            debug(`Invalid move (either invalid stack or not a move).`);
            return;
        }
        debug(`Dropping ${disk.id} onto ${tower.id}`);

        for (let t of towers) { t.disks = t.disks.filter(d => d.id !== disk.id) }
        tower.disks.unshift(disk); // adds disk at position [0]
        moves += 1;

        tick().then(() => setTimeout(checkForWin, 100)); // 100ms delay for animation
    }

    function checkForWin() {
        if (towers[2].disks.length === nDisks) {
            showToastMessage(`Congratulations! You solved the puzzle in ${moves} moves! Minimum moves: ${minMoves}`);
        } else if (towers[1].disks.length === nDisks) {
            wrongTower();
        }
    }

    function wrongTower() {
        showToastMessage(`Wrong tower, buddy.`);
    }

    let moveIsValid: boolean = false;
    let moves: number = $state(0);
    let minMoves: number = $derived.by(() => {
        return Math.pow(2, nDisks) - 1;
    });

    function onDroppableEnter(x, y, Operation, offeredTypeList, diskref: HTMLDivElement, tower: Tower) {
        debug(`${diskref.id} entering zone of ${tower.id}`);
        const thisWidth = parseInt(diskref.dataset.width || '', 10);
        const thatWidth = tower.disks.length > 0 ? tower.disks[0].width : Infinity;
        moveIsValid = thisWidth < thatWidth;
        debug(`Move is ${moveIsValid ? 'real and valid' : 'invalid or not a move'} (this: ${thisWidth} <= that: ${thatWidth})`);
    }

    function resetGame() {
        towers[0].disks = disks;
        towers[1].disks = [];
        towers[2].disks = [];
        moves = 0;
    }

    function addDisk() {
        if (nDisks <= 7) {
            nDisks += 1;
            resetGame();
        } else {
            debug("Maximum number of disks reached.");
        }
    }

    function removeDisk() {
        if (nDisks > 1) {
            nDisks -= 1;
            resetGame();
        } else {
            debug("Minimum number of disks reached.");
        }
    }

    let toastMessage = $state("");
    let showToast = $state(false);

    function showToastMessage(message: string) {
        toastMessage = message;
        showToast = true;
        setTimeout(() => showToast = false, 7000);
    }

</script>


<div id="towers-of-hanoi-container" class="towers-of-hanoi wide">
    {#if showToast}
        <div class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            {toastMessage}
        </div>
    {/if}
    {#each towers as tower, index}
        <div
            class="tower-block"
            id={tower.id}
            data-index={index + 1}
            role="region"
            aria-label={`Tower ${index + 1}`}
            bind:this={tower.blockref}
            draggable="false"
            use:asDropZone={{
                Extras: tower,
                TypesToAccept: { 'text/plain': 'all' },
                onDroppableEnter,
                onDrop
            }}
        >
            <div class="tower" draggable="false">
                
                {#each tower.disks as disk, i}
                    <div
                        class="disk {topDisks.includes(disk.id) ? 'top-disk' : ''}"
                        id={disk.id}
                        bind:this={disk.divref}
                        role="region"
                        aria-label={`Disk ${i + 1}`}
                        style="background-color: {disk.color}; width: {disk.width}%;"
                        data-width={disk.width}
                        use:asDroppable={{
                            Extras: disk.divref,
                            Operations: 'move',
                            DataToOffer: { 'text/plain': disk.id },
                        }}
                    ></div>
                {/each}
            </div>
        </div>
    {/each}
</div>

<button onclick={() => removeDisk() }>- Disk</button>
<button onclick={() => addDisk() }>+ Disk</button>
<br>
<button onclick={() => resetGame() }>Reset</button>

<p>Moves: {moves}</p>
<p>Minimum Moves: {minMoves}</p>


<style>
    p {
        font-family: sans-serif;
        font-size: 1.2em;
    }
    button {
        font-family: consolas, monospace;
        font-size: 1em;
        margin: 5px;
    }
    .towers-of-hanoi {
        position: relative;
        border: 2px solid #ccc;
        margin: 10px; /* outer margin */
        padding: 0px; /* inner padding */
        width: 100%;
        aspect-ratio: 5 / 2;
        /* box-sizing: border-box; */
        /* position: relative; */
        display: flex; /* flexbox for automatic positioning */
        justify-content: space-around; /* spaces tower blocks evenly */
        align-items: flex-end; /* aligns tower blocks against bottom */
    }

    .tower-block {
        width: 32%;
        height: 100%;
        /* border: 2px dotted blue; */
        display: flex;
        align-items: flex-end; /* aligns tower against bottom of block */
        justify-content: center;
    }

    .tower {
        width: 7%;
        height: 50%;
        border: 2px solid black;
        background-color: #4d4d4d;
        display: flex; /* flexbox for automatic positioning */
        flex-direction: column; /* stacks disks vertically */
        align-items: center; /* centers disks horizontally */
        justify-content: flex-end; /* aligns disks against bottom */
        border-radius: 7px;
        pointer-events: none; /* allows drop events to pass through to tower-block */
    }
    .disk {
        height: 10%;
        border: 1px solid black;
        border-radius: 10px;
        margin: 0px; /* vertical spacing between disks */
    }
    .top-disk {
        pointer-events: auto; /* re-enables drag events on top disk */
        cursor: grab;

    }
    :global(.disk.dragged) { display:none }

    .toast {
        position: absolute; /* Change from fixed to absolute */
        top: 10px; /* Adjust as needed for top positioning */
        left: 50%;
        transform: translateX(-50%);
        background: #333;
        color: white;
        padding: 10px 10px;
        border-radius: 5px;
        z-index: 1000;
    }

</style>