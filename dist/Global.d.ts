import React from "react";
import { Reactor } from "./";
export interface GlobalReactorProps<R, S> {
    globalReactor: R;
    globalState: S;
}
export default function Global<R extends Reactor<any, S, any>, //reactor
S, //global-state
P = {}>(Component: React.ComponentClass<P & GlobalReactorProps<R, S>, any>, key: string): React.ComponentClass<Omit<P, keyof GlobalReactorProps<R, S>>, GlobalReactorProps<R, S>>;
