<script lang="ts">

    import debugLib from "debug";
    const debug = debugLib("exp:ccg:routing");
    let debugEnabled = false;
    // import { PUBLIC_ENV } from '$env/static/public';
    // if (PUBLIC_ENV === 'dev') {
    //     debugLib.enable("exp:*");
    //     localStorage.debug = "exp:*";
    //     debugEnabled = true;
    // }
    
    import { PressedKeys } from "runed";
    const keys = new PressedKeys();
    keys.onKeys(["d", "e", "b", "u", "g"], () => {
        toggleDebug();
    });

    function toggleDebug() {
        debugEnabled = !debugEnabled;
        if (debugEnabled) {
            debugLib.enable("exp:*");
            localStorage.debug = "exp:*";
            debug("Debug mode enabled");
        } else {
            debugLib.disable();
            localStorage.debug = "";
            console.log("Debug mode disabled");
        }
    }

    let { children } = $props();

</script>

<div class="layout-container">
    <div class="sidebar-nav-instructions">
        <h3>Instructions</h3>
        <nav class="sidebar-nav-list">
            <ul>
                <li><a href="welcome">Welcome</a></li>
                <li><a href="comprehension-intro">Comprehension</a></li>
                <li><a href="game-intro">Game</a></li>
                <li><a href="exit-survey">Debrief</a></li>
            </ul>
        </nav>
    </div>

    <div class="page-content">{@render children()}</div>

    <div class="sidebar-extra">
        <h3>Extra Section</h3>
        <p>I might put some info or stats here.</p>
    </div>
</div>

<style>
    .layout-container {
        display: flex;
        height: 100vh; /* Full viewport height */
    }
    .sidebar-nav-instructions {
        flex-basis: 200px;
        flex-shrink: 0;
        flex-grow: 0;
        background-color: #f0f0f0;
        height: 100vh;
        font-weight: bold;
        text-align: center;
    }

    .sidebar-nav-list ul {
        padding: 0;
        margin: 0;
    }
    .sidebar-nav-list li {
        list-style: none;
        display: block;
        box-sizing: border-box;
        border: #000000 1px solid;
        padding: 1rem 1rem 1rem 1rem;
        background: thistle;
        font: 1em sans-serif;

        
    }
    .page-content {
        flex-basis: 800px;
        flex-shrink: 1;
        flex-grow: 1;
        padding-left: 2rem;
        padding-right: 2rem;

        /* max-width: 800px; Optional: limit max width for readability */
    }

    .sidebar-extra {
        flex-basis: 200px;
        flex-shrink: 0;
        flex-grow: 0;
        background-color: #f9f9f9; /* Light background for contrast */
        height: 100vh; /* Full viewport height */
        padding: 1rem;
    }
</style>