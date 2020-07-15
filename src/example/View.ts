import TestReactor, { ActionType, State } from "./TestReactor";
import { Subject } from "rxjs";
import { map } from "rxjs/operators";

export class View {
    
    private reactor! : TestReactor;
    private viewAction : Subject<ActionType> = new Subject<ActionType>();
    private state: State;
    
    constructor(){
        this.state = {
            value : 0
        }

        this.reactor = new TestReactor(this.state);
        this.viewAction.subscribe(this.reactor.action);

        this.reactor.state.pipe(
            map( value => value.value )
        ).subscribe(
            res=> document.querySelector<HTMLDivElement>('#test').textContent = res.toString() 
        )
    }
}

// For test...
new View();