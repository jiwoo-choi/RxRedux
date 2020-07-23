import { Subject, empty, queueScheduler } from 'rxjs';
import { flatMap, startWith, scan, catchError, shareReplay, tap, observeOn, takeUntil } from 'rxjs/operators';
import { DisposeBag, Stub } from './';
var Reactor = /** @class */ (function () {
    function Reactor(initialState, isStubEnabled, isGlobal) {
        if (isStubEnabled === void 0) { isStubEnabled = false; }
        if (isGlobal === void 0) { isGlobal = false; }
        this.scheduler = queueScheduler; //only subclass can change scheduler.
        this._disposeBag = new DisposeBag(); //only 
        this._isGlobal = isGlobal;
        this.dummyAction = new Subject();
        this._initialState = initialState;
        if (isStubEnabled) {
            this._stub = new Stub(this);
            this.action = this.stub.action;
            this._state = this.stub.state;
        }
        else {
            this.action = new Subject();
            this._state = this.createStream();
        }
    }
    Object.defineProperty(Reactor.prototype, "initialState", {
        // private actionWeakMap = new WeakMap();
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
    Object.defineProperty(Reactor.prototype, "isGlobal", {
        get: function () {
            return this._isGlobal;
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
        if (this.isGlobal) {
            console.warn("This Reactor is not supposed to disposed. Please check your codes again.");
        }
        else {
            this.disposeBag.unsubscribe();
        }
    };
    Object.defineProperty(Reactor.prototype, "disposedBy", {
        set: function (subscription) {
            if (subscription) {
                if (this.isGlobal) {
                    console.warn("This Reactor is not supposed to disposed bag. Please check your codes again.");
                }
                else {
                    this.disposeBag.add(subscription);
                }
            }
            else {
                return;
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
