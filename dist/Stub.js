import { BehaviorSubject, Subject } from 'rxjs';
var Stub = /** @class */ (function () {
    function Stub(reactor) {
        var _this = this;
        this.actions = [];
        this.state = new BehaviorSubject(reactor.initialState);
        this.action = new Subject();
        reactor.disposedBy = this.state.asObservable()
            .subscribe(function (state) {
            reactor.currentState = state;
        });
        reactor.disposedBy = this.action.subscribe(function (action) {
            _this.actions.push(action);
        });
    }
    Object.defineProperty(Stub.prototype, "lastAction", {
        get: function () {
            if (this.actions.length < 1) {
                return this.actions[0];
            }
            else {
                return this.actions[this.actions.length - 1];
            }
        },
        enumerable: false,
        configurable: true
    });
    return Stub;
}());
export default Stub;
