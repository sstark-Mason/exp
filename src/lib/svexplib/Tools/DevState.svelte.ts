let isDev = $state(false);
export const devState = {
    get current() { return isDev; },
    set current(value: boolean) { isDev = value; console.log("isDev:", isDev); },
    ToggleEvent() { isDev = !isDev; console.log("isDev:", isDev); },
};


