import {Reactor} from './Reactor'
import {BehaviorSubject, Subject} from 'rxjs'

export class Stub<SAction, SState, SMutate> {

    public state: BehaviorSubject<SState>;
    public action: Subject<SAction>;
    public actions : SAction[] = [];
    
    constructor(reactor: Reactor<SAction, SState, SMutate>) {

        this.state = new BehaviorSubject<SState>(reactor.initialState);
        this.action = new Subject<SAction>();

        const stateSubscription = this.state.asObservable()
        .subscribe(
            state=> { 
                reactor.currentState =  state
            }
        )

        const actionSubscription = this.action.subscribe(
            action=>{
                this.actions.push(action)
            }
        )
    
    }
}