import { Reactor } from './';
import { BehaviorSubject, Subject } from 'rxjs';
export default class Stub<SAction, SState, SMutate> {
    state: BehaviorSubject<SState>;
    action: Subject<SAction>;
    actions: SAction[];
    constructor(reactor: Reactor<SAction, SState, SMutate>);
    get lastAction(): SAction;
}
