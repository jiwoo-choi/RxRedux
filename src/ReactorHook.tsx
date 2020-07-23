import { Reactor } from "./";
import { Observable } from "rxjs";
import { useState } from "react";
import { tap } from "rxjs/operators";


export default abstract class ReactorHook<Action,State,Mutation = Action> extends Reactor<Action,State,Mutation> {

    private static setState:any;
    private static updator:number = 1;

    private static flush(){
        ReactorHook.setState(ReactorHook.updator *= -1);
    } 

    static use<Action,State,Mutation>(this: new (initialState: State, isStubEnabled : boolean, isGlobal : boolean) => ReactorHook<Action,State,Mutation>, initialState: State , isStubEnabled : boolean = false, isGlobal : boolean = false) : [ReactorHook<Action,State,Mutation>, State] {
        ReactorHook.setState = useState(1)[1];
        const [state, setState] = useState<any>(undefined);
        if (!state) {
            const self = new this(initialState, isStubEnabled, isGlobal);
            setState(self)
        }
        const currentState = (!state) ? initialState : state.currentState;
        return [state, currentState];
    }    

    protected transformState(state: Observable<State>): Observable<State> {
        return state.pipe( tap( ()=> ReactorHook.flush() ));
    }
}


