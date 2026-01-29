<script lang="ts">
    import { PUBLIC_ENV } from '$env/static/public';
    import debugLib from 'debug';
    let debugEnabled = false;
    if (PUBLIC_ENV === 'dev') {
        debugLib.enable('exp:*')
        localStorage.setItem('debug', 'exp:*');
        debugEnabled = true;
    }

    import { PressedKeys } from 'runed';
    const keys = new PressedKeys();
    keys.onKeys(['d', 'e', 'b', 'u', 'g'], () => {
        toggleDebug();
    });

    function toggleDebug() {
        debugEnabled = !debugEnabled;
        if (debugEnabled) {
            debugLib.enable('exp:*')
            localStorage.setItem('debug', 'exp:*');
            console.log('Debug mode enabled');
        } else {
            debugLib.disable();
            localStorage.setItem('debug', '');
            console.log('Debug mode disabled');
        }
    }
    
</script>