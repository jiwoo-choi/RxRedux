import { Reactor } from "../Reactor";
import { Observable, of } from "rxjs";

export interface State {
    value: number
}

export const INCREASE = 'INCREASE'
export const DECREASE = 'DECREASE'

interface INCREASEACTION {
    type: typeof INCREASE
}

interface DECRASEACTION {
    type: typeof DECREASE
}

export type ActionType = INCREASEACTION | DECRASEACTION

export default class TestReactor extends Reactor<ActionType,State> {

    transformAction(action: Observable<ActionType>): Observable<ActionType> {
        return action
    }
    transformMutation(mutation: Observable<ActionType>): Observable<ActionType> {
        return mutation
    }
    transformState(state: Observable<State>): Observable<State> {
        return state;
    }

    mutate(action: ActionType): Observable<ActionType> {
        switch(action.type) {
            case "INCREASE":
                return of(action)
            case "DECREASE":
                return of(action)
        }
    }
    reduce(state: State, mutation: ActionType): State {
        let newState = state;
        switch(mutation.type) {
            case "INCREASE" :
                newState.value = newState.value + 1
                return newState;

            case "DECREASE" :
                newState.value = newState.value - 1
                return newState
        }
    }
}

