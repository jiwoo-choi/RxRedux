import { Observable, Subject } from 'rxjs';
declare abstract class Reactor<Action, State = {}, Mutation = Action> {
    action: Subject<Action>;
    initialState: State;
    currentState: State;
    state: Observable<State>;
    constructor(initialState: State);
    abstract mutate(action: Action): Observable<Mutation>;
    abstract reduce(state: State, mutation: Mutation): State;
}
export default Reactor;
