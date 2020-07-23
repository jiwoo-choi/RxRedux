import React from "react";
export var GlobalReactor = React.createContext({});
export function register(globalReactorList) {
    return globalReactorList.reduce(function (prev, curr) {
        if (!curr.isGlobal) {
            console.warn("This reactor is not set as global. Please set them as GlobalReactor to avoid being disposed.");
        }
        prev[curr.name] = curr;
        return prev;
    }, {});
}
export function getGlobalReactorWith(key, from) {
    if (!from) {
        return undefined;
    }
    if (typeof key === 'string') {
        return from[key];
    }
    else {
        return from[key.name];
    }
}
