let isDev = $state(false);
export const devState = {
    get current() { return isDev; },
    ToggleEvent() { isDev = !isDev; console.log("isDev:", isDev); },
};


