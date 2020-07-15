"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
class Reactor {
    constructor(initialState) {
        this.action = new rxjs_1.Subject();
        this.initialState = initialState;
        let mutation = this.action.pipe(operators_1.flatMap((action) => {
            return this.mutate(action);
        }));
        this.state = mutation.pipe(operators_1.scan((state, mutate) => {
            return this.reduce(state, mutate);
        }, this.initialState), operators_1.startWith(this.initialState), operators_1.share());
        this.state.subscribe(res => {
            this.currentState = res;
            console.log(res);
        });
    }
}
exports.default = Reactor;
