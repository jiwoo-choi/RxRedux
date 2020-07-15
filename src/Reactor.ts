import { Observable, Subject } from 'rxjs'
import { flatMap, startWith, scan, share } from 'rxjs/operators'

abstract class Reactor<Action, State = {}, Mutation = Action> {

    action : Subject<Action> = new Subject<Action>();
    initialState! : State
    currentState! : State
    state!: Observable<State>

    constructor(initialState : State){

        this.initialState = initialState;
        let mutation = this.action.pipe( 
            flatMap(
                (action) => {
                    return this.mutate(action);
                }
            )
        )

        this.state = mutation.pipe(
            scan(( state, mutate) => {
                return this.reduce( state, mutate );
            }, this.initialState)
            ,startWith(this.initialState),
            share()
        )

        this.state.subscribe(
            res=> {
                this.currentState = res;
                console.log(res);
            }
        )
          
    }

    abstract mutate(action : Action): Observable<Mutation>;
    abstract reduce(state: State, mutation: Mutation): State;

}

export default Reactor