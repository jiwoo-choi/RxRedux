import { Observable ,Subject, Scheduler, empty, queueScheduler, Subscription } from 'rxjs'
import { flatMap, startWith, scan, catchError, shareReplay, tap,  observeOn, takeUntil, switchMap, distinctUntilChanged} from 'rxjs/operators'
import { Stub } from './';
import { DisposeBag } from './';


export type ReactorControlType<Action, State> = { dispatcher: (action: Action) => (...args: any)=>void  , stateStream: Observable<State>, getState: ()=>State}
export type ReactorControlProps<Action,State> = { reactor_control? : ReactorControlType<Action,State>}

export default abstract class Reactor<Action = {}, State = {}, Mutation = Action> {

    private dummyAction: Subject<any>;
    private _action : Subject<Action>;
    
    private _initialState! : State; 
    public currentState! : State; 
    private _state!: Observable<State>; 
    private _stub!: Stub<Action,State,Mutation>; 
    protected scheduler : Scheduler = queueScheduler; 
    private _disposeBag : DisposeBag = new DisposeBag();
    private _isStubEnabled : boolean;

    /** unique ID  */
    public readonly REACTORID$ = "REACTORKIT_REACTOR" 

    get initialState() {
        return this._initialState;
    }

    get state() {
        return this._state;
    }

    get stub() {
        return this._stub;
    }

    get action(){
        return this._action;
    }


    getReactorControl(transformState?: Observable<State>) : ReactorControlType<Action, State>{
        if (transformState) {
            return { dispatcher: this.dispatchFn, stateStream: transformState, getState:this.getState}
        } else {
            return { dispatcher: this.dispatchFn, stateStream: this.state, getState:this.getState}
        }
    }

    constructor(initialState : State, isStubEnabled : boolean = false){
        
        this._isStubEnabled = isStubEnabled;
        this.dummyAction = new Subject<any>(); 
        this._initialState = initialState;

        if (this._isStubEnabled) {
            this._stub = new Stub(this);
            this._action = this.stub!.action;
            this._state = this.stub!.state
        } else {
            this._action = new Subject<Action>();
            this._state = this.createStream();
        }

        this.dispatch = this.dispatch.bind(this);
        this.dispatchFn = this.dispatchFn.bind(this);
        this.getReactorControl = this.getReactorControl.bind(this);
        this.getState = this.getState.bind(this);

    }

    get name(){
        return this.constructor.name
    }

    getState(){
        return this.currentState;
    }

    abstract mutate(action : Action): Observable<Mutation>;
    abstract reduce(state: State, mutation: Mutation): State;

    public dispatch(action : Action) {
        this.action.next(action)
    }

    public dispatchFn(action : Action): (...args: any)=>void {
        let self = this;
        return function (...args:any) {
            self.action.next(action)
        }
    }

    protected transformAction(action: Observable<Action>): Observable<Action> {
        return action
    }

    protected transformMutation(mutation: Observable<Mutation>): Observable<Mutation> {
        return mutation
    }

    protected transformState(state: Observable<State>): Observable<State> {
        return state
    }

    disposeOperator(){
        return takeUntil(this.dummyAction)
    }

    disposeAll2() {
        this.dummyAction.next();
        this.dummyAction.complete();
    }

    disposeAll(){
        this.disposeBag.unsubscribe();
    }
    
    set disposedBy(subscription: Subscription | undefined) {
        if (subscription) {
                this.disposeBag.add(subscription)
        }
    }

    get disposeBag(){
        return this._disposeBag;
    }

    private createStream(): Observable<State> {

        let action = this.action.pipe(observeOn(this.scheduler))
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
                return this.reduce( {...state}, mutate );
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



