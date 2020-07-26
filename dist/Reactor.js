import { Subject, empty, queueScheduler } from 'rxjs';
import { flatMap, startWith, scan, catchError, shareReplay, tap, observeOn, takeUntil } from 'rxjs/operators';
import { Stub } from './';
import { DisposeBag } from './';
var Reactor = /** @class */ (function () {
    function Reactor(initialState, isStubEnabled) {
        if (isStubEnabled === void 0) { isStubEnabled = false; }
        this.scheduler = queueScheduler;
        this._disposeBag = new DisposeBag();
        /** unique ID  */
        this.REACTORID$ = "REACTORKIT_REACTOR";
        this._isStubEnabled = isStubEnabled;
        this.dummyAction = new Subject();
        this._initialState = initialState;
        if (this._isStubEnabled) {
            this._stub = new Stub(this);
            this._action = this.stub.action;
            this._state = this.stub.state;
        }
        else {
            this._action = new Subject();
            this._state = this.createStream();
        }
    }
    Object.defineProperty(Reactor.prototype, "initialState", {
        get: function () {
            return this._initialState;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Reactor.prototype, "state", {
        get: function () {
            return this._state;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Reactor.prototype, "stub", {
        get: function () {
            return this._stub;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Reactor.prototype, "action", {
        get: function () {
            return this._action;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Reactor.prototype, "name", {
        get: function () {
            return this.constructor.name;
        },
        enumerable: false,
        configurable: true
    });
    Reactor.prototype.dispatch = function (action) {
        this.action.next(action);
    };
    Reactor.prototype._dispatch = function (action) {
        var self = this;
        return function () {
            self.action.next(action);
        };
    };
    Reactor.prototype.transformAction = function (action) {
        return action;
    };
    Reactor.prototype.transformMutation = function (mutation) {
        return mutation;
    };
    Reactor.prototype.transformState = function (state) {
        return state;
    };
    Reactor.prototype.disposeOperator = function () {
        return takeUntil(this.dummyAction);
    };
    Reactor.prototype.disposeAll2 = function () {
        this.dummyAction.next();
        this.dummyAction.complete();
    };
    Reactor.prototype.disposeAll = function () {
        this.disposeBag.unsubscribe();
    };
    Object.defineProperty(Reactor.prototype, "disposedBy", {
        set: function (subscription) {
            if (subscription) {
                this.disposeBag.add(subscription);
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Reactor.prototype, "disposeBag", {
        get: function () {
            return this._disposeBag;
        },
        enumerable: false,
        configurable: true
    });
    Reactor.prototype.createStream = function () {
        var _this = this;
        var action = this.action.pipe(observeOn(this.scheduler));
        var transformedAction = this.transformAction(action);
        var mutation = transformedAction.pipe(flatMap(function (action) {
            return _this.mutate(action).pipe(catchError(function (err) { return empty(); }));
        }));
        var transformedMutation = this.transformMutation(mutation);
        var state = transformedMutation.pipe(scan(function (state, mutate) {
            return _this.reduce(state, mutate);
        }, this.initialState), catchError(function () {
            return empty();
        }), startWith(this.initialState));
        var transformedState = this.transformState(state)
            .pipe(tap(function (state) {
            _this.currentState = state;
        }), shareReplay(1));
        this.disposedBy = transformedState.subscribe();
        return transformedState;
    };
    return Reactor;
}());
export default Reactor;
