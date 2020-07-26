import { Observable, Subject, Scheduler, Subscription } from 'rxjs';
import { Stub } from './';
import { DisposeBag } from './';
export default abstract class Reactor<Action = {}, State = {}, Mutation = Action> {
    private dummyAction;
    private _action;
    private _initialState;
    currentState: State;
    private _state;
    private _stub;
    protected scheduler: Scheduler;
    private _disposeBag;
    private _isStubEnabled;
    /** unique ID  */
    readonly REACTORID$ = "REACTORKIT_REACTOR";
    get initialState(): State;
    get state(): Observable<State>;
    get stub(): Stub<Action, State, Mutation>;
    get action(): Subject<Action>;
    constructor(initialState: State, isStubEnabled?: boolean);
    get name(): string;
    abstract mutate(action: Action): Observable<Mutation>;
    abstract reduce(state: State, mutation: Mutation): State;
    dispatch(action: Action): void;
    _dispatch(action: Action): () => void;
    protected transformAction(action: Observable<Action>): Observable<Action>;
    protected transformMutation(mutation: Observable<Mutation>): Observable<Mutation>;
    protected transformState(state: Observable<State>): Observable<State>;
    disposeOperator(): import("rxjs").MonoTypeOperatorFunction<unknown>;
    disposeAll2(): void;
    disposeAll(): void;
    set disposedBy(subscription: Subscription | undefined);
    get disposeBag(): DisposeBag;
    private createStream;
}
