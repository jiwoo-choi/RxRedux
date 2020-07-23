import { Reactor, DisposeBag } from "./";
import { ComponentClass } from "react";
import React from "react";
export interface reactorTesterKit {
    childProps: any;
    childState: any;
    childRef: any;
}
export interface reactorAccessible<P extends Reactor<any, any, any>> {
    reactor?: P;
}
export interface ReactorView<P extends Reactor<any, any, any>> extends reactorAccessible<P> {
    bind(reactor: P): DisposeBag;
}
export default function ReactiveView<R extends Reactor<any, any, any>, State = any, P = {}>(Component: ComponentClass<P, State>): React.ComponentClass<P>;
