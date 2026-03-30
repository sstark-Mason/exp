<script lang>

    import { PUBLIC_ENV } from '$env/static/public';
    import { PressedKeys } from 'runed';
    import { devState } from '$svexplib/Tools/DevState.svelte.ts';
    if (PUBLIC_ENV === 'dev') { devState.current = true; }
    const keys = new PressedKeys();
    keys.onKeys(["d", "e", "v"], () => { devState.current = !devState.current; });


    let { data, children } = $props();

</script>

<div class="exp-page">
    {@render children()}
</div>