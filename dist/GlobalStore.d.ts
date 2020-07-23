import React from "react";
import { Reactor } from "./";
export interface GlobalReactorType {
    [key: string]: Reactor<any, any, any>;
}
export declare const GlobalReactor: React.Context<GlobalReactorType>;
export declare function register(globalReactorList: Reactor<any, any, any>[]): GlobalReactorType;
export declare function getGlobalReactorWith(key: Reactor<any, any, any> | string, from: GlobalReactorType): Reactor<any, any, any> | undefined;
