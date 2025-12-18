<script lang="ts">

    import { asDroppable, asDropZone } from 'svelte-drag-and-drop-actions'
    import debugLib from "debug";
    import type { derived } from 'svelte/store';
    const debug = debugLib("svexplib:Screening");

    let { items, numCategories } = $props();

    interface item {
        value: string;
        categories: string[];
        spanRef: HTMLSpanElement | undefined;
    }

    interface dropZone {
        id: string;
        items: item[];
        divRef: HTMLDivElement | undefined;
    }

    const itemList: item[] = $derived.by(() => {
        const arr: item[] = [];
        for (let i = 0; i < items.length; i++) {
            arr.push({
                value: items[i].value,
                categories: items[i].categories,
                spanRef: undefined,
            });
        }
        debug(`items: ${arr.map(i => i.value)}`);
        return arr;
    });

    const dropZones: dropZone[] = $derived.by(() => {
        const arr: dropZone[] = [];
        for (let i = 0; i < numCategories; i++) {
            arr.push({
                id: `dropzone-${i + 1}`,
                items: [],
                divRef: undefined,
            });
        }
        debug(`dropZones: ${arr.map(dz => dz.id)}`);
        return arr;
    });

    // const numCategoriesArray: Array<number> = $derived.by(() => {
    //     const arr: number[] = [];
    //     for (let i = 0; i < numCategories; i++) {
    //         arr.push(i+1);
    //     }
    //     debug(`numCategoriesArray: ${arr}`);
    //     return arr;
    // });

    function getCategories(props: item[]): string[] {
        const categories:  string[] = [];

        for (let item of props) {
            for (let category of item.categories) {
                if (!categories.includes(category)) {
                    categories.push(category);
                }
            }
        }
        debug(`Categories (${categories.length}): ${categories}`);
        return categories;
    }

    function onDroppableEnter(x, y, Operation, DataOffered, spanRef: HTMLSpanElement, dropZoneExtras) {
        debug(`${spanRef?.dataset.itemvalue} entered dz ${dropZoneExtras.id}`);
    }

    function onDrop(x, y, Operation, DataOffered, spanRef: HTMLSpanElement, dropZoneExtras) {
        
    }
    
</script>

<h3>Please divide the following items into {numCategories} categories by dragging and dropping them into the appropriate boxes below.</h3>
<br>
<div class="items-container">
    {#each itemList as item}
        <span class="item"
            id={`${item.value}`}
            data-itemValue={item.value}
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
<br>
<div class="categories-container">
    {#each dropZones as dropZone, index}
        <div class="category-drop-zone"
            id={dropZone.id}
            data-index={index+1}
            use:asDropZone={{
                Extras: dropZone,
                TypesToAccept: { 'text/plain': 'all' },
                onDroppableEnter,
                onDrop
            }}
            bind:this={dropZone.divRef}>
        </div>
    {/each}
    <!-- {#each numCategoriesArray as _, index}
        <div class="category-drop-zone"
            data-index={index}
            use:asDropZone={{
                onDroppableEnter,
                onDrop
            }}>
        </div>
    {/each} -->
</div>

<style>
    .items-container {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 20px;
    }

    .item {
        padding: 10px 15px;
        background-color: #f0f0f0;
        border: 1px solid #ccc;
        border-radius: 5px;
        cursor: grab;
        user-select: none;
    }

    .categories-container {
        display: flex;
        gap: 20px;
    }

    .category-drop-zone {
        flex: 1;
        min-height: 150px;
        border: 2px dashed #ccc;
        border-radius: 5px;
        padding: 10px;
        background-color: #fafafa;
    }
</style>


