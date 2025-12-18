<script lang="ts">

    import { asDroppable, asDropZone } from 'svelte-drag-and-drop-actions'
    import debugLib from "debug";
    import type { derived } from 'svelte/store';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    const debug = debugLib("exp:screening-task");

    let { items, numCategories, onAllCategorized, onAllCorrect } = $props();

    interface item {
        value: string;
        categories: string[]
        spanRef: HTMLSpanElement | undefined;
        currentZone: number;
    }

    interface dropZone {
        id: string;
        items: item[];
        divRef: HTMLDivElement | undefined;
    }

    let itemList: item[] = $state([]);
    let dropZones: dropZone[] = $state([]);

    for (let i = 0; i < numCategories+1; i++) {
        dropZones.push({
            id: `dz-${i}`,
            items: [],
            divRef: undefined,
        });
    }
    debug(`mounted dropZones: ${dropZones.map(dz => dz.id)}`);

    for (let i = 0; i < items.length; i++) {
        itemList.push({
            value: items[i].value,
            categories: items[i].categories,
            spanRef: undefined,
            currentZone: 0,
        });
    }
    itemList = itemList.sort(() => Math.random() - 0.5);
    debug(`mounted items: ${itemList.map(i => i.value)}`);

    dropZones[0].items = itemList;


    function onDroppableEnter(x, y, Operation, DataOffered, spanRef: HTMLSpanElement, dropZoneExtras) {
        debug(`${spanRef?.dataset.itemvalue} entered dz ${dropZoneExtras.id}`);
    }

    function onDrop(x, y, Operation, DataOffered, spanRef: HTMLSpanElement, dropZoneExtras) {
        debug(`${spanRef?.dataset.itemvalue} dropped into dz ${dropZoneExtras.id}`);
        const itemValue = DataOffered['text/plain'];
        const item = itemList.find(i => i.value === itemValue);
        if (item) {
            // Remove from previous zone
            const prevZone = dropZones[item.currentZone];
            if (prevZone) {
                prevZone.items = prevZone.items.filter(i => i.value !== itemValue);
            }
            
            // Add to new zone
            dropZoneExtras.items.push(item);
            item.currentZone = parseInt(dropZoneExtras.id.split('-')[1]);
        }

        checkIfAllCategorized();
        checkCorrectness();
    }

    let allCategorized = $state(false);

    function checkIfAllCategorized(): boolean {
        if (dropZones[0].items.length !== 0) {
            debug(`Not complete: ${dropZones[0].items.length} items still in bank`);
            allCategorized = false;
            onAllCategorized?.(false);
            return false;
        }
        allCategorized = true;
        onAllCategorized?.(true);
        return true;
    }

    function getCategories(items: item[]): string[] {
        const categories: string[] = [];
        for (let item of items) {
            for (let category of item.categories) {
                if (!categories.includes(category)) {
                    categories.push(category);
                }
            }
        }
        return categories;
    }

    function checkCorrectness(): boolean {
        for (let i = 1; i < dropZones.length; i++) {
            const dz = dropZones[i];
            const categories = getCategories(dz.items);
            debug(`dz ${dz.id} has categories: ${categories}`);
            if (categories.length !== 1) {
                onAllCorrect?.(false);
                return false;
            }
        }
        debug(`All items correctly categorized`);
        onAllCorrect?.(true);
        return true;
    }

</script>

<h3>Please divide the following items into {numCategories} categories by dragging and dropping them into the appropriate boxes below.</h3>
<br>

<div class="main-container">

    <div class="bank-container">
        <div class="dropzone"
            id={dropZones[0].id}
            draggable=false
            use:asDropZone={{
                Extras: dropZones[0],
                TypesToAccept: { 'text/plain': 'all' },
                onDroppableEnter,
                onDrop
            }}
            bind:this={dropZones[0].divRef}>
        {#each dropZones[0].items as item (item.value)}
            <span class="item"
                id={`item-${item.value}`}
                data-itemvalue={item.value}
                bind:this={item.spanRef}
                use:asDroppable={{
                    Extras: item.spanRef,
                    Operations: 'move',
                    DataToOffer: { 'text/plain': item.value },
                }}>
                {item.value}
            </span>
        {/each}
        </div>
    </div>

    <div class="category-container" style="--num-categories: {numCategories}">
        {#each dropZones.slice(1) as dz (dz.id)}
            <div class="dropzone"
                id={dz.id}
                use:asDropZone={{
                    Extras: dz,
                    TypesToAccept: { 'text/plain': 'all' },
                    onDroppableEnter,
                    onDrop
                }}
                bind:this={dz.divRef}>
                {#each dz.items as item (item.value)}
                    <span class="item"
                        id={`item-${item.value}`}
                        data-itemvalue={item.value}
                        bind:this={item.spanRef}
                        use:asDroppable={{
                            Extras: item.spanRef,
                            Operations: 'move',
                            DataToOffer: { 'text/plain': item.value },
                        }}>
                        {item.value}
                    </span>
                {/each}
            </div>
        {/each}
    </div>
</div>

<style>
    .main-container {
        /* border: 1px dotted grey; */
    }

    .bank-container {
        /* border: 2px dashed blue; */
        box-sizing: border-box;
    }

    .category-container {
        display: flex;
        /* border: 2px dashed green; */
        box-sizing: border-box;
    }

    .category-container .dropzone {
        flex: 1;
        margin-top: -1px;
    }

    .category-container .dropzone:not(:last-child) {
        margin-right: -1px;
    }


    .dropzone {
        display: flex;
        flex-wrap: wrap;
        border: 1px solid grey;
        min-height: 75px;
        min-width: 75px;
        width: calc(100% / (var(--num-categories)) - 0px);
        box-sizing: border-box;
        align-items: center;
        justify-content: center;
    }
 
    .item {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2em;
        width: 50px;
        height: 50px;
        margin: 5px;
        background-color: #f0f0f0;
        border: 1px solid #ccc;
        border-radius: 5px;
        cursor: grab;        
    }
</style>