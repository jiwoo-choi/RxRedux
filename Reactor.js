"use strict";
exports.__esModule = true;
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var Reactor = /** @class */ (function () {
    function Reactor(initialState) {
        var _this = this;
        this.action = new rxjs_1.Subject();
        this.initialState = initialState;
        var mutation = this.action.pipe(operators_1.flatMap(function (action) {
            return _this.mutate(action);
        }));
        this.state = mutation.pipe(operators_1.scan(function (state, mutate) {
            return _this.reduce(state, mutate);
        }, this.initialState), operators_1.startWith(this.initialState), operators_1.share());
        this.state.subscribe(function (res) {
            _this.currentState = res;
            console.log(res);
        });
    }
    return Reactor;
}());
exports["default"] = Reactor;
