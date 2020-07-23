import { Observable ,Subject, Scheduler, empty, queueScheduler, Subscription } from 'rxjs'
import { flatMap, startWith, scan, catchError, shareReplay, tap,  observeOn, takeUntil} from 'rxjs/operators'
import { Stub } from './Stub';
import { DisposeBag } from './DisposeBag';

export abstract class Reactor<Action = {}, State = {}, Mutation = Action> {

    private _isGlobal: boolean;
    private dummyAction: Subject<any>;
    public action : Subject<Action>;
    private _initialState! : State; // only set once, then read-only. 
    public currentState! : State; // this does not affect actual value. this value is only for test.
    private _state!: Observable<State>; // nobody cannot change state except this.
    private _stub?: Stub<Action,State,Mutation>; 
    protected scheduler : Scheduler = queueScheduler; //only subclass can change scheduler.
    private _disposeBag : DisposeBag = new DisposeBag(); //only 

    // private actionWeakMap = new WeakMap();

    get initialState() {
        return this._initialState;
    }

    get state() {
        return this._state;
    }

    get stub() {
        return this._stub;
    }

    get isGlobal() {
        return this._isGlobal;
    }

    constructor(initialState : State, isStubEnabled : boolean = false, isGlobal : boolean = false){
            
        this._isGlobal = isGlobal
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

    get name(){
        return this.constructor.name
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

    disposeOperator(){
        return takeUntil(this.dummyAction)
    }

    disposeAll2() {
        this.dummyAction.next();
        this.dummyAction.complete();
    }

    disposeAll(){
        if (this.isGlobal) {
            console.warn("This Reactor is not supposed to disposed. Please check your codes again.")
        } else {
            this.disposeBag.unsubscribe();
        }
    }
    
    set disposedBy(subscription: Subscription | undefined) {
        if (subscription) {

            if (this.isGlobal) {
                console.warn("This Reactor is not supposed to disposed bag. Please check your codes again.")
            } else {
                this.disposeBag.add(subscription)
            }
        } else {
            return;
        }
    }

    get disposeBag(){
        return this._disposeBag;
    }

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



