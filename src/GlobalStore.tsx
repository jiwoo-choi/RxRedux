import React from "react";
import { Reactor } from "./";

export interface GlobalReactorType {
    [key:string]: Reactor<any,any,any>
}

export const GlobalReactor = React.createContext<GlobalReactorType>({});

export function register( globalReactorList : Reactor<any,any,any>[] ): GlobalReactorType{
        return globalReactorList.reduce( (prev, curr) => {
            if (!curr.isGlobal) {
                console.warn("This reactor is not set as global. Please set them as GlobalReactor to avoid being disposed." )
            }
            prev[curr.name] = curr;
            return prev;

        }, {} as GlobalReactorType)
}


export function getGlobalReactorWith( key : Reactor<any,any,any> | string , from : GlobalReactorType) : Reactor<any,any,any> | undefined {

    if (!from) {
        return undefined;
    }

    if (typeof key === 'string') {
        return from[key] 
    } else {
        return from[key.name]
    }
}

