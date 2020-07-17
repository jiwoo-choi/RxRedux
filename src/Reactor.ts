import { Observable, Subject, Scheduler, queueScheduler, empty } from 'rxjs'
import { flatMap, startWith, scan, share, catchError, tap, shareReplay } from 'rxjs/operators'
import { Stub } from './Stub';


export abstract class Reactor<Action = {}, State = {}, Mutation = Action> {

    action : Subject<Action>;
    initialState! : State;
    currentState! : State;
    state!: Observable<State>;
    stub: Stub<Action,State,Mutation>;
    protected scheduler : Scheduler = queueScheduler;

    constructor(initialState : State, isStubEnabled : boolean = false){

        this.initialState = initialState;
        this.stub = new Stub(this);

        if (isStubEnabled) {
            this.action = this.stub.action;
            this.state = this.stub.state
        } else {
            this.action = new Subject<Action>();
            this.state = this.createStream();
        }
    }


    abstract mutate(action : Action): Observable<Mutation>;
    abstract reduce(state: State, mutation: Mutation): State;
    abstract transformAction(action: Observable<Action>): Observable<Action>;
    abstract transformMutation(mutation: Observable<Mutation>): Observable<Mutation>;
    abstract transformState(state: Observable<State>): Observable<State>;

    private createStream(): Observable<State> {

        let transformedAction : Observable<Action> = this.transformAction(this.action);
        let mutation = transformedAction.pipe( 
            flatMap(
                (action) => {
                    return this.mutate(action).pipe(catchError( err => empty()))
                }
            )
        )

        let transformedMutation : Observable<Mutation> = this.transformMutation(mutation);
        let state = transformedMutation.pipe(
            scan((state, mutate) => {
                return this.reduce( state, mutate );
            }, this.initialState),
            catchError( () => {
                return empty()
            })
            ,startWith(this.initialState),
        )

        let transformedState : Observable<State> = this.transformState(state)

        .pipe(
            tap( (state) => {
                this.currentState = state
            }),
            shareReplay(1)
        )

        //for making observable to hot-reloading
        transformedState.subscribe();

        return transformedState;
    }

}

