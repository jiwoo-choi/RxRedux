import Reactor from "../Reactor";
import { Observable } from "rxjs";
export interface State {
    value: number;
}
export declare const INCREASE = "INCREASE";
export declare const DECREASE = "DECREASE";
interface INCREASEACTION {
    type: typeof INCREASE;
}
interface DECRASEACTION {
    type: typeof DECREASE;
}
export declare type ActionType = INCREASEACTION | DECRASEACTION;
export default class TestReactor extends Reactor<ActionType, State> {
    mutate(action: ActionType): Observable<ActionType>;
    reduce(state: State, mutation: ActionType): State;
}
export {};
