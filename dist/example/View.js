"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.View = void 0;
const TestReactor_1 = require("./TestReactor");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
class View {
    constructor() {
        this.viewAction = new rxjs_1.Subject();
        this.state = {
            value: 0
        };
        this.reactor = new TestReactor_1.default(this.state);
        this.viewAction.subscribe(this.reactor.action);
        this.reactor.state.pipe(operators_1.map(value => value.value)).subscribe(res => document.querySelector('#test').textContent = res.toString());
    }
}
exports.View = View;
// For test...
new View();
