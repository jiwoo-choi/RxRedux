import { Reactor } from "./";
import { Observable } from "rxjs";
export default abstract class ReactorHook<Action, State, Mutation = Action> extends Reactor<Action, State, Mutation> {
    private static setState;
    private static updator;
    private static flush;
    static use<Action, State, Mutation>(this: new (initialState: State, isStubEnabled: boolean, isGlobal: boolean) => ReactorHook<Action, State, Mutation>, initialState: State, isStubEnabled?: boolean, isGlobal?: boolean): [ReactorHook<Action, State, Mutation>, State];
    protected transformState(state: Observable<State>): Observable<State>;
}
