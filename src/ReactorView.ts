import { Reactor } from "./Reactor";

export interface ReactorView<T extends Reactor<any,any,any>> {
    bind(reactor:T):void;
    getReactor():T | undefined;
}
