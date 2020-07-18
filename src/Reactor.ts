import { Observable ,Subject, Scheduler, empty, queueScheduler, Subscription } from 'rxjs'
import { flatMap, startWith, scan, catchError, shareReplay, tap,  observeOn, takeUntil} from 'rxjs/operators'
import { Stub } from './Stub';
import { DisposeBag } from './DisposeBag';

export abstract class Reactor<Action = {}, State = {}, Mutation = Action> {


    private dummyAction: Subject<any>;
    public action : Subject<Action>;
    private _initialState! : State; // only set once, then read-only. 
    public currentState! : State; // this does not affect actual value. this value is only for test.
    private _state!: Observable<State>; // nobody cannot change state except this.
    private _stub?: Stub<Action,State,Mutation>; 
    protected scheduler : Scheduler = queueScheduler; //only subclass can change scheduler.
    private _disposeBag : DisposeBag = new DisposeBag(); //  
    
    get initialState() {
        return this._initialState;
    }

    get state() {
        return this._state;
    }

    get stub() {
        return this._stub;
    }

    constructor(initialState : State, isStubEnabled : boolean = false){

        this.dummyAction = new Subject<any>(); 

        this._initialState = initialState;

        if (isStubEnabled) {
            this._stub = new Stub(this);
            this.action = this.stub!.action;
            this._state = this.stub!.state
        } else {
            this.action = new Subject<Action>();
            this._state = this.createStream();
        }
    }

    abstract mutate(action : Action): Observable<Mutation>;
    abstract reduce(state: State, mutation: Mutation): State;

    protected transformAction(action: Observable<Action>): Observable<Action> {
        return action;
    }
    protected transformMutation(mutation: Observable<Mutation>): Observable<Mutation> {
        return mutation;
    }
    protected transformState(state: Observable<State>): Observable<State> {
        return state;
    }

    /// https://blog.codecentric.de/en/2018/01/different-ways-unsubscribing-rxjs-observables-angular/
    /// https://medium.com/angular-in-depth/rxjs-avoiding-takeuntil-leaks-fb5182d047ef
    /// rxjs operator.  
    disposeOperator(){
        return takeUntil(this.dummyAction)
    }
    
    disposeAll2() {
        this.dummyAction.next();
        this.dummyAction.complete();
    }

    /// dispose using disposeBag.
    disposeAll(){
        this.disposeBag.unsubscribe();
    }
    
    /// add dispose bag.
    set disposedBy(subscription: Subscription | undefined) {
        if (subscription) {
            this.disposeBag.add(subscription)
        } else {
            return;
        }
    }

    get disposeBag(){
        return this._disposeBag;
    }

    //we can use take until.
    //using  view..
    //finalziae
    private createStream(): Observable<State> {

        let action = this.action.pipe( observeOn(this.scheduler))
        let transformedAction : Observable<Action> = this.transformAction(action);
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
            shareReplay(1),
        )

        this.disposedBy = transformedState.subscribe();
        return transformedState;
    }

}



